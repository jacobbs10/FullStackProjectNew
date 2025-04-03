// User.js
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Product.css";

const Product = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // Fixed from const [error, setError] = null

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:8000/api/product/${id}`, {
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => setError(err.message));
  }, [id]);

  const RenderObject = ({ obj, level = 0 }) => {
    return (
      <>
       <div className={`nested-level-${level}`}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="field">
            {typeof value === "object" && value !== null ? (
              <>
                <span className="key">{key}:</span>
                <RenderObject obj={value} level={level + 1} />
              </>
            ) : (
              <p>
                <span className="key">{key}:</span>{" "}
                <span className="value">{value}</span>
              </p>
            )}
          </div>
        ))}
      </div>
      </>
    );
  };

  if (error) return <p>Error: {error}</p>;
  return (
    <div className="product-container">
      {data ? <RenderObject obj={data} /> : <p>Loading...</p>}
    </div>
  );
};
export default Product;