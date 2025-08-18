import { useEffect, useState } from 'react';
import { testBackendConnection, submitToBackend } from '../utils/apiService';

const BackendTest = () => {
  const [message, setMessage] = useState('');
  const [input, setInput] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      const data = await testBackendConnection();
      setMessage(data.message);
    };
    checkConnection();
  }, []);

  const handleSubmit = async () => {
    const result = await submitToBackend({ content: input });
    alert(`Backend response: ${JSON.stringify(result)}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Backend Connection Test</h2>
      <p>Status: {message}</p>
      
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Test data..."
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleSubmit}>Send to Backend</button>
    </div>
  );
};

export default BackendTest;