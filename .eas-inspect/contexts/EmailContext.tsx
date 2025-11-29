import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { MockEmail } from '../types';
import { Storage } from '../utils/storage';

interface EmailContextType {
  emails: MockEmail[];
  loading: boolean;
  processEmail: (emailId: string) => void;
  getUnprocessedEmails: () => MockEmail[];
  refreshEmails: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const useEmails = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmails must be used within an EmailProvider');
  }
  return context;
};

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [emails, setEmails] = useState<MockEmail[]>([]);
  const [loading, setLoading] = useState(true);

  // Load emails from storage on mount, or initialize with mock data
  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = () => {
    try {
      setLoading(true);
      const storedEmails = Storage.getEmails();
      setEmails(storedEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEmail = (emailId: string) => {
    try {
      Storage.updateEmail(emailId, { isProcessed: true });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, isProcessed: true }
            : email
        )
      );
    } catch (error) {
      console.error('Error processing email:', error);
    }
  };

  const getUnprocessedEmails = (): MockEmail[] => {
    return emails.filter(email => !email.isProcessed);
  };

  const refreshEmails = () => {
    loadEmails();
  };

  const value: EmailContextType = {
    emails,
    loading,
    processEmail,
    getUnprocessedEmails,
    refreshEmails,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};
