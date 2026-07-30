// src/pages/_error.js — עוטף את קומפוננטת השגיאה המובנית של Next כדי למנוע
// "missing required error components, refreshing..." ב-dev כששרת הפיתוח/תיקיית .next לא מסונכרנים
import Error from "next/error";

function CustomError({ statusCode }) {
  return <Error statusCode={statusCode} />;
}

CustomError.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
