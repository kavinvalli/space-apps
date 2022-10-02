export function Popup({
  title,
  children,
  date,
}: {
  title: string;
  children: any;
  date: string;
}) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderRadius: "15px",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <span>{date}</span>
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "24px" }}>
          {title}
        </span>
        <div style={{ fontFamily: "Lato", fontSize: "20px" }}>{children}</div>
      </div>
    </div>
  );
}
