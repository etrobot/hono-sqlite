import React from 'react';

interface LoginComponentProps {
  password: string;
  setPassword: (value: string) => void;
  handleLogin: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ password, setPassword, handleLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Enter Password</h1>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="bg-darcula-card text-darcula-fg border border-darcula-border p-3 mb-4 rounded-sm"
      />
      <button onClick={handleLogin} className="bg-teal-600 text-white p-3 rounded-sm">
        Login
      </button>
    </div>
  );
};

export default LoginComponent; 