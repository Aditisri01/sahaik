from better_profanity import profanity

def filter_profanity(text):
    if profanity.contains_profanity(text):
        filtered = profanity.censor(text, '[filtered]')
        return filtered, "Please avoid inappropriate language. Let's keep our conversation respectful."
    return text, None 