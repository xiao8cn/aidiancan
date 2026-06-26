export function ProfilePage() {
  const entries = [
    {
      title: '历史记录',
      description: '查看吃过和推荐过的记录入口',
      status: '待接入',
    },
    {
      title: '偏好设置',
      description: '管理口味、距离和路线偏好入口',
      status: '待接入',
    },
    {
      title: '关于应用',
      description: '了解今天吃啥的使用说明入口',
      status: '静态',
    },
  ]

  return (
    <section
      style={{
        minHeight: 'calc(100dvh - 101px)',
        padding: '18px 16px 24px',
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 36%, #f7f8fa 100%)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 26,
          padding: '0 10px',
          borderRadius: 999,
          background: 'rgba(255, 138, 0, 0.12)',
          color: '#ad4e00',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        我的
      </div>

      <h1
        style={{
          margin: '10px 0 6px',
          color: '#1f1f1f',
          fontSize: 26,
          lineHeight: 1.18,
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        个人中心入口
      </h1>
      <p
        style={{
          margin: 0,
          color: '#686f7a',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        这里会承接历史、偏好和应用信息。当前仅展示入口结构，不读取或展示任何个人数据。
      </p>

      <div
        aria-label="个人页状态"
        style={{
          marginTop: 18,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          padding: 16,
          background: '#fff',
          boxShadow: '0 10px 30px rgba(31, 31, 31, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#fff3e0',
              color: '#ad4e00',
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            人
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: '0 0 6px',
                color: '#1f1f1f',
                fontSize: 18,
                lineHeight: 1.35,
                fontWeight: 750,
              }}
            >
              个人功能尚未接入
            </h2>
            <p
              style={{
                margin: 0,
                color: '#7a808a',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              后续会把真实历史和偏好放在这里。现在不生成虚构记录，也不执行任何数据操作。
            </p>
          </div>
        </div>

        <div
          aria-label="我的入口"
          style={{
            marginTop: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          {entries.map((entry) => (
            <div
              key={entry.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: 8,
                padding: '12px 14px',
                background: '#fffaf2',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: '#1f1f1f',
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {entry.title}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: '#8a9099',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {entry.description}
                </div>
              </div>
              <span
                style={{
                  flex: '0 0 auto',
                  color: '#ad4e00',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {entry.status}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            margin: '14px 0 0',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            paddingTop: 14,
            color: '#686f7a',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          真实的导出、清除和设置能力会在后续任务中接入；当前页面只作为导航入口展示。
        </p>
      </div>
    </section>
  )
}
