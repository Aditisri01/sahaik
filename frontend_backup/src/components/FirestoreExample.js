import React, { useState, useEffect } from 'react';
import { testService, responseService } from '../services/firestore';

// Example: Updated StudentTestPortal component using Firestore
export default function FirestoreExample() {
  const [testList, setTestList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example: Fetch tests using Firestore
  const fetchTestList = async (class_name, subject) => {
    setLoading(true);
    setError(null);
    try {
      const tests = await testService.getTestsByClassAndSubject(class_name, subject);
      setTestList(tests);
    } catch (err) {
      setError('Failed to fetch tests from Firestore');
      console.error('Firestore error:', err);
    }
    setLoading(false);
  };

  // Example: Submit test response using Firestore
  const submitTestResponse = async (testId, studentId, answers, score) => {
    try {
      const responseData = {
        test_id: testId,
        student_id: studentId,
        answers: answers,
        score: score,
        date: new Date().toISOString()
      };
      
      const responseId = await responseService.submitResponse(responseData);
      console.log('Response submitted with ID:', responseId);
      return responseId;
    } catch (err) {
      console.error('Failed to submit response:', err);
      throw err;
    }
  };

  // Example: Get student history using Firestore
  const getStudentHistory = async (studentId) => {
    try {
      const history = await responseService.getStudentHistory(studentId);
      return history;
    } catch (err) {
      console.error('Failed to get student history:', err);
      throw err;
    }
  };

  return (
    <div>
      <h2>Firestore Integration Example</h2>
      <p>This component shows how to use Firestore instead of JSON files.</p>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <div>
        <h3>Test List ({testList.length} tests)</h3>
        {testList.map(test => (
          <div key={test.id} style={{border: '1px solid #ccc', padding: '10px', margin: '5px'}}>
            <h4>{test.topic}</h4>
            <p>Class: {test.class} | Subject: {test.subject}</p>
            <p>Questions: {test.questions?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 