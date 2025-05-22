import React from 'react';

function Boton({ children, onClick, type = 'button', ...props }) {
  return (
    <button type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export default Boton;
