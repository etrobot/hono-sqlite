import { useEffect, useState } from 'react';
import ListComponent from './components/ListComponent';

function App() {
  const [projects, setProjects] = useState<Record<string, Record<string, string>>>({});
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedPassword = localStorage.getItem('authPassword');
    if (storedPassword) {
      setPassword(storedPassword);
      setIsAuthenticated(true);
      fetchConfig(storedPassword);
    }
  }, []);

  const fetchConfig = (authPassword: string) => {
    fetch('/api/config', {
      headers: {
        'X-Auth-Password': authPassword,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('authPassword');
          return Promise.reject('Unauthorized');
        }
        return res.json();
      })
      .then((data) => setConfig(data))
      .catch((error) => console.error('Error fetching config:', error));
  };



  // 新增项目
  const handleAddProject = async () => {
    if (!newProjectName) return;
    if (projects[newProjectName]) {
      alert('该项目名已存在，不能重复添加！');
      return;
    }
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Password': password,
        },
        body: JSON.stringify({ name: newProjectName, data: {} }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || '添加项目失败');
        console.error('添加项目失败:', result);
        return;
      }
      setNewProjectName('');
      fetchProjects();
    } catch (error) {
      alert('网络错误，无法添加项目');
      console.error('添加项目异常:', error);
    }
  };

  // 删除项目
  const handleDeleteProject = async (name: string) => {
    if (!window.confirm(`确定要删除项目 ${name} 吗？`)) return;
    await fetch(`/api/project/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: {
        'X-Auth-Password': password,
      },
    });
    // 如果删除的是当前选中项目，重置选中
    if (selectedProject === name) setSelectedProject('');
    fetchProjects();
  };

  // 新增 key 到当前项目
  const handleAddKey = async () => {
    if (!selectedProject || !newKey) return;
    const projectData = { ...(projects[selectedProject] || {}) };
    if (Object.prototype.hasOwnProperty.call(projectData, newKey)) {
      alert('该 key 已存在，不能重复添加！');
      return;
    }
    projectData[newKey] = newValue;
    await fetch(`/api/project/${encodeURIComponent(selectedProject)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Password': password,
      },
      body: JSON.stringify({ data: projectData }),
    });
    setNewKey('');
    setNewValue('');
    fetchProjects();
  };

  // 编辑 key
  const handleEditKey = async (key: string, oldValue: string) => {
    const value = window.prompt(`请输入新的值 (key: ${key})`, oldValue);
    if (value === null || value === oldValue) return;
    const projectData = { ...(projects[selectedProject] || {}) };
    projectData[key] = value;
    await fetch(`/api/project/${encodeURIComponent(selectedProject)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Password': password,
      },
      body: JSON.stringify({ data: projectData }),
    });
    fetchProjects();
  };

  // 删除 key
  const handleDeleteKey = async (key: string) => {
    if (!window.confirm(`确定要删除 key: ${key} 吗？`)) return;
    const projectData = { ...(projects[selectedProject] || {}) };
    delete projectData[key];
    await fetch(`/api/project/${encodeURIComponent(selectedProject)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Password': password,
      },
      body: JSON.stringify({ data: projectData }),
    });
    fetchProjects();
  };


  // 编辑项目（弹窗输入新值）
  const handleEdit = async (key: string, oldValue: string) => {
    const value = window.prompt(`请输入新的值 (key: ${key})`, oldValue);
    if (value === null || value === oldValue) return;
    await fetch(`/api/project/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Password': password,
      },
      body: JSON.stringify({ value }),
    });
    fetchProjects();
  };

  // 删除项目
  const handleDelete = async (keyToDelete: string) => {
    if (!window.confirm(`确定要删除项目: ${keyToDelete} 吗？`)) {
      return;
    }
    await fetch(`/api/project/${encodeURIComponent(keyToDelete)}`, {
      method: 'DELETE',
      headers: {
        'X-Auth-Password': password,
      },
    });
    fetchProjects();
  };

  // 获取所有项目
  const fetchProjects = (authPass?: string) => {
    fetch('/api/project', {
      headers: {
        'X-Auth-Password': authPass || password,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('authPassword');
          return Promise.reject('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        // 如果当前没有选中项目，默认选第一个
        const keys = Object.keys(data);
        if (!selectedProject && keys.length > 0) {
          setSelectedProject(keys[0]);
        } else if (keys.length === 0) {
          setSelectedProject('');
        }
      })
      .catch((error) => console.error('Error fetching projects:', error));
  };

  // 登录后拉取项目
  const handleLogin = () => {
    if (password) {
      localStorage.setItem('authPassword', password);
      setIsAuthenticated(true);
      fetchProjects(password);
    }
  };

  // config 结构与 db.json 保持一致
const [config, setConfig] = useState({
  projects: {
    project1: {
      key1: "value1",
    },
    project2: {
      key1: "value1",
    }
  }
});

// 首次挂载拉取项目
  useEffect(() => {
    const storedPassword = localStorage.getItem('authPassword');
    if (storedPassword) {
      setPassword(storedPassword);
      setIsAuthenticated(true);
      fetchProjects(storedPassword);
    }
  }, []);

  const handleSave = () => {
    fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Password': password,
      },
      body: JSON.stringify(config),
    });
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold mb-4">Enter Password</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-4"
          />
          <button onClick={handleLogin} className="bg-blue-500 text-white p-2">
            Login
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-6">项目管理</h1>
          <div className="flex gap-8">
  <div className="w-1/3">
    <ListComponent
      title="项目列表"
      items={Object.keys(projects).map(name => ({ id: name, key: name }))}
      emptyMessage="暂无项目"
      type="project"
      onDelete={(item) => handleDeleteProject(item.key)}
      addFormComponent={
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="新项目名"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="border p-2 flex-1"
          />
          <button
            onClick={handleAddProject}
            className="bg-blue-500 text-white p-2 rounded"
          >
            添加项目
          </button>
        </div>
      }
    />
  </div>
  <div className="w-2/3">
              {selectedProject ? (
                <ListComponent
                  title={`项目：${selectedProject}`}
                  items={Object.entries(projects[selectedProject] || {}).map(([key, value]) => ({ id: key, key, value }))}
                  onEdit={(item) => handleEditKey(item.key, item.value as string)}
                  onDelete={(item) => handleDeleteKey(item.key)}
                  addFormComponent={
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        placeholder="Key"
                        value={newKey}
                        onChange={e => setNewKey((e.target as HTMLInputElement).value)}
                        className="border p-2 flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={newValue}
                        onChange={e => setNewValue((e.target as HTMLInputElement).value)}
                        className="border p-2 flex-1"
                      />
                      <button
                        onClick={handleAddKey}
                        className="bg-blue-500 text-white p-2 rounded border flex-1"
                      >
                        添加Key
                      </button>
                    </div>
                  }
                />
              ) : (
                <h2 className="text-xl font-bold mb-4">请选择一个项目</h2>
              )}
    </div>
  </div>
        </div>
      )}
    </div>
  );
}

export default App;