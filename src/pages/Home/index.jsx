import React from 'react';

function Home() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <h1>👁️ Olha o Produto</h1>
      <p>Se você está vendo isso, o site está ONLINE!</p>
      <button onClick={() => alert('Funcionando!')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Teste de Botão
      </button>
    </div>
  );
}

export default Home;