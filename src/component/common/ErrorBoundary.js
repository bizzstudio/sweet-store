import React from "react";

// רשת ביטחון גלובלית: תופסת שגיאות רינדור בצד הלקוח כדי שתקלה ברכיב בודד
// לא תפיל את כל האתר למסך לבן / "client-side exception". במקום זה מוצגת הודעה
// ידידותית בעברית עם אפשרות לרענן.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // לוג לקונסול בלבד (בלי לחשוף פרטים לגולש)
    if (typeof console !== "undefined") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            fontFamily: "inherit",
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
            אופס, משהו השתבש
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "20px", maxWidth: "420px" }}>
            אירעה תקלה זמנית בטעינת העמוד. נסו לרענן — בדרך כלל זה פותר את הבעיה.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 28px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            רענון העמוד
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
