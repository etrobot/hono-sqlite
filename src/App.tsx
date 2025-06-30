import { useEffect, useState } from 'react';
import ListComponent from './components/ListComponent';
import AddFormComponent from './components/AddFormComponent';
import LoginComponent from './components/LoginComponent';

function App() {
  const [projects, setProjects] = useState<Record<string, Record<string, string>>>({});
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stopinkPassword = localStorage.getItem('authPassword');
    if (stopinkPassword) {
      setPassword(stopinkPassword);
      setIsAuthenticated(true);
      fetchConfig(stopinkPassword);
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

  // 删项目
  const handleDeleteProject = async (name: string) => {
    if (!window.confirm(`确定要删项目 ${name} 吗？`)) return;
    await fetch(`/api/project/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: {
        'X-Auth-Password': password,
      },
    });
    // 如果删的是当前选中项目，重置选中
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

  // 删 key
  const handleDeleteKey = async (key: string) => {
    if (!window.confirm(`确定要删 key: ${key} 吗？`)) return;
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

  // 复制 key
  const handleCopyKey = async (key: string, value: string) => {
    const projectData = { ...(projects[selectedProject] || {}) };
    const newKey = window.prompt(`请输入新 key (当前值: ${key})`);
    if (!newKey) return;
    if (Object.prototype.hasOwnProperty.call(projectData, newKey)) {
      alert('该 key 已存在，不能重复添加！');
      return;
    }
    projectData[newKey] = value;
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
    const stopinkPassword = localStorage.getItem('authPassword');
    if (stopinkPassword) {
      setPassword(stopinkPassword);
      setIsAuthenticated(true);
      fetchProjects(stopinkPassword);
    }
  }, []);

  // 复制项目
  const handleCopyProject = async (name: string) => {
    const newName = window.prompt(`请输入新项目名 (当前: ${name})`);
    if (!newName) return;
    if (projects[newName]) {
      alert('该项目名已存在，不能重复添加！');
      return;
    }
    const data = { ...(projects[name] || {}) };
    await fetch('/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Password': password,
      },
      body: JSON.stringify({ name: newName, data }),
    });
    fetchProjects();
  };

  return (
    <div className="container max-w-7xl mx-auto p-3 dark bg-darcula-bg text-darcula-fg min-h-screen">
      {!isAuthenticated ? (
        <LoginComponent
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
        />
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-6">配置管理</h1>
          <div className="flex gap-8">
  <div className="w-1/3">
    <ListComponent
      title="项目列表"
      items={Object.keys(projects).map(name => ({ id: name, key: name }))}
      emptyMessage="暂无项目"
      type="project"
      onDelete={(item) => handleDeleteProject(item.key)}
      onCopy={(item) => handleCopyProject(item.key)}
      addFormComponent={
        <AddFormComponent
          type="project"
          keyValue={newProjectName}
          onKeyChange={e => setNewProjectName(e.target.value)}
          onAdd={handleAddProject}
          keyPlaceholder="新项目名"
          addButtonText="添加项目"
        />
      }
      selectedId={selectedProject}
      onSelect={item => setSelectedProject(item.key)}
    />
  </div>
  <div className="w-2/3">
              {selectedProject ? (
                <ListComponent
                  title={`${selectedProject}`}
                  items={Object.entries(projects[selectedProject] || {}).map(([key, value]) => ({ id: key, key, value }))}
                  onEdit={(item) => handleEditKey(item.key, item.value as string)}
                  onDelete={(item) => handleDeleteKey(item.key)}
                  onCopy={(item) => handleCopyKey(item.key, item.value as string)}
                  addFormComponent={
                    <AddFormComponent
                      type="default"
                      keyValue={newKey}
                      valueValue={newValue}
                      onKeyChange={e => setNewKey((e.target as HTMLInputElement).value)}
                      onValueChange={e => setNewValue((e.target as HTMLInputElement).value)}
                      onAdd={handleAddKey}
                      keyPlaceholder="Key"
                      valuePlaceholder="Value"
                      addButtonText="添加Key"
                    />
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