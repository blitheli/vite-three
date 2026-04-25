import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import StageGlb from './StageGlb.jsx'

// 新增测试项目时，在这里追加 { id, name, description, component } 即可。
const projects = [
  {
    id: 'stage-glb',
    name: 'GLB 标注测试',
    description: '加载 Hubble 模型，并用 Drei Html 做兴趣点标注。',
    component: StageGlb,
  },
  {
    id: 'rocketFlame',
    name: 'rocketFlame',
    description: '火箭尾焰测试页面，内容暂时为空。',
    component: RocketFlamePage,
  },
]

function RocketFlamePage() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <mesh rotation={[0.4, 0.6, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff8a2a" />
      </mesh>
    </>
  )
}

function EmptyProject() {
  return (
    <div className="empty-project">
      <p className="eyebrow">Test Lab</p>
      <h2>选择左侧测试项目</h2>
      <p>后续新增测试项目时，在 projects 配置中添加一项即可出现在导航栏。</p>
    </div>
  )
}

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId),
    [activeProjectId],
  )

  const ActiveScene = activeProject?.component

  return (
    <main className={isSidebarOpen ? 'app-shell' : 'app-shell sidebar-closed'}>
      {isSidebarOpen ? (
        <aside className="sidebar">
          <div className="brand-row">
            <div className="brand">
              <span className="brand-mark">R3F</span>
              <div>
                <h1>Three 测试台</h1>
                <p>快速切换实验页面</p>
              </div>
            </div>
            <button
              className="sidebar-close"
              type="button"
              aria-label="关闭导航栏"
              onClick={() => setIsSidebarOpen(false)}
            >
              ×
            </button>
          </div>

          <nav className="project-nav" aria-label="测试项目导航">
            {projects.map((project) => (
              <button
                className={project.id === activeProjectId ? 'nav-item active' : 'nav-item'}
                key={project.id}
                type="button"
                onClick={() => setActiveProjectId(project.id)}
              >
                <span>{project.name}</span>
                <small>{project.description}</small>
              </button>
            ))}
          </nav>
        </aside>
      ) : (
        <button
          className="sidebar-open"
          type="button"
          aria-label="打开导航栏"
          onClick={() => setIsSidebarOpen(true)}
        >
          导航
        </button>
      )}

      <section className="content-panel">
        <div className="scene-card">
          {ActiveScene ? (
            <Canvas camera={{ position: [0, 1.2, 3.2], fov: 45 }}>
              <ActiveScene />
            </Canvas>
          ) : (
            <EmptyProject />
          )}
        </div>
      </section>
    </main>
  )
}
