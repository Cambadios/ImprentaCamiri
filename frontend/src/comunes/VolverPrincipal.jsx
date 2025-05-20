import React from 'react';
import { Link } from 'react-router-dom';

const VolverPrincipal = () => (
  <div style={{ marginBottom: '20px' }}>
    <Link to="/admin" style={{ textDecoration: 'none' }}>
      <button style={{
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        ← Volver a Admin
      </button>
    </Link>
  </div>
);

export default VolverPrincipal;
