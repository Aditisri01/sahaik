import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function StudentReportAdmin() {
  const [students, setStudents] = useState([]); // [{student_id, name, student_class, testCount}]
  const [selectedClass, setSelectedClass] = useState('');
  const allClasses = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
  ];

  useEffect(() => {
    // Fetch all test responses and build unique student list
    const fetchData = async () => {
      try {
        // Assume backend endpoint returns all responses for all tests
        const res = await axios.get(`${API_BASE_URL}/all_test_responses`);
        // res.data: { test_id: { student_id: { answers, score }, ... }, ... }
        const studentMap = {};
        Object.values(res.data).forEach(testResp => {
          Object.entries(testResp).forEach(([student_id, resp]) => {
            if (!studentMap[student_id]) {
              studentMap[student_id] = { student_id, testCount: 0 };
            }
            studentMap[student_id].testCount += 1;
          });
        });
        // Fetch student names/classes from backend for all IDs
        const ids = Object.keys(studentMap);
        if (ids.length > 0) {
          const namesRes = await axios.post(`${API_BASE_URL}/get_students_info`, { ids });
          ids.forEach(id => {
            studentMap[id].name = namesRes.data[id]?.name || id;
            studentMap[id].student_class = namesRes.data[id]?.student_class || '';
          });
        }
        const all = Object.values(studentMap);
        setStudents(all);
      } catch (e) {
        setStudents([]);
      }
    };
    fetchData();
  }, []);

  const filtered = selectedClass ? students.filter(s => s.student_class === selectedClass) : students;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #e6f0fa', padding: 40 }}>
      <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 900, fontSize: '2.1rem', letterSpacing: 0.5 }}>Student Report</h2>
      <div style={{ marginBottom: 24, display: 'flex', gap: 18, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Class:</label>
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16, minWidth: 120 }}
        >
          <option value=''>All Classes</option>
          {allClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafdff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px #e6f0fa', fontSize: 17 }}>
        <thead>
          <tr style={{ background: '#e0edff', color: '#174ea6', fontWeight: 700 }}>
            <th style={{ padding: 14, textAlign: 'left' }}>Student Name</th>
            <th style={{ padding: 14, textAlign: 'left' }}>Student ID</th>
            <th style={{ padding: 14, textAlign: 'left' }}>Class</th>
            <th style={{ padding: 14, textAlign: 'center' }}>Tests Taken</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={4} style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: 24 }}>No students found.</td></tr>
          ) : (
            filtered.map((s, i) => (
              <tr key={s.student_id} style={{ background: i % 2 === 0 ? '#fff' : '#f6f4ef' }}>
                <td style={{ padding: 13 }}>{s.name}</td>
                <td style={{ padding: 13 }}>{s.student_id}</td>
                <td style={{ padding: 13 }}>{s.student_class}</td>
                <td style={{ padding: 13, textAlign: 'center' }}>{s.testCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 