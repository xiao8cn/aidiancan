export function NearbyPage() {
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
        附近候选
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
        先把周边选择放在这里
      </h1>
      <p
        style={{
          margin: 0,
          color: '#686f7a',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        后续会承接真实附近结果，用来快速比较距离、路线和可选范围。当前不会展示或伪造具体餐厅数据。
      </p>

      <div
        aria-label="附近列表未接入"
        style={{
          marginTop: 18,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          padding: 16,
          background: '#fff',
          boxShadow: '0 10px 30px rgba(31, 31, 31, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
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
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            ·
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
              暂无附近列表
            </h2>
            <p
              style={{
                margin: 0,
                color: '#7a808a',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              这里会作为附近候选的列表入口。等真实数据接入后，再展示可比较的候选项。
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          <div
            style={{
              border: '1px dashed rgba(173, 78, 0, 0.28)',
              borderRadius: 8,
              padding: '12px 14px',
              background: '#fffaf2',
            }}
          >
            <div style={{ color: '#1f1f1f', fontSize: 15, fontWeight: 700 }}>
              即将承接真实候选
            </div>
            <div style={{ marginTop: 4, color: '#8a9099', fontSize: 13, lineHeight: 1.5 }}>
              先保留列表位置，不提前写死任何商家、评分或距离。
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              paddingTop: 14,
              color: '#686f7a',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <span>现在可先回到“今天”完成定位、筛选和随机选餐。</span>
            <span
              aria-hidden="true"
              style={{
                flex: '0 0 auto',
                color: '#ad4e00',
                fontWeight: 700,
              }}
            >
              待接入
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
