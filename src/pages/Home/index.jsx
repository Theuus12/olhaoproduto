import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile 
} from 'firebase/auth';

// --- IMAGENS ---
import logoImg from '../../assets/logo.png'; 

import { 
  Container, Header, Hero, Button, SearchContainer, InputBusca, 
  SectionTitle, ReviewsContainer, ProductCard, ProductImage, 
  ProductInfo, Stars, ModalOverlay, ProductModalContent, 
  BuyButton, ModalContent, FormInput, ActionButton, CloseButton 
} from './styles';

function Home() {
  // --- ESTADOS GERAIS ---
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('home'); 
  const [abaPerfil, setAbaPerfil] = useState('dados'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // --- ESTADOS USUÁRIO ---
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // --- ESTADOS FORMULÁRIO PRODUTO ---
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [moeda, setMoeda] = useState('BRL'); 
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [linkCompra, setLinkCompra] = useState('');
  const [imagensBase64, setImagensBase64] = useState([]);

  // --- LISTA DE 20 NOMES DE MARCAS ---
  const nomesMarcas = [
    'Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'ASUS', 
    'Xiaomi', 'Philips', 'Logitech', 'Razer', 'Corsair', 'Brastemp', 
    'Consul', 'Nvidia', 'AMD', 'Intel', 'Xbox', 'PlayStation'
  ];

  // --- ESTILO DE ANIMAÇÃO GLOBAL ---
  const animacaoStyles = `
    @keyframes fadeInModal {
      from { opacity: 0; transform: translateY(-20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes overlayFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .anima-modal {
      animation: fadeInModal 0.3s ease-out forwards;
    }
    .anima-overlay {
      animation: overlayFade 0.2s ease-out forwards;
    }
  `;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogado(user);
    });
    buscarProdutos();
    return () => unsubscribe();
  }, []);

  const buscarProdutos = async () => {
    try {
      const produtosCol = collection(db, 'produtos');
      const q = query(produtosCol, orderBy('criadoEm', 'desc'));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(lista);
    } catch (error) { console.error("Erro ao buscar:", error); }
  };

  // --- LÓGICA DE BUSCA FUNCIONAL ---
  const produtosFiltrados = produtos.filter((p) => {
    const termo = termoBusca.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(termo) || 
      p.marca?.toLowerCase().includes(termo) ||
      p.description?.toLowerCase().includes(termo)
    );
  });

  const comprimirImagem = (base64Str) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleFileChange = (e) => {
    const arquivos = Array.from(e.target.files);
    arquivos.forEach(arquivo => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const comprimida = await comprimirImagem(reader.result);
        setImagensBase64((prev) => [...prev, comprimida]);
      };
      reader.readAsDataURL(arquivo);
    });
  };

  const handleSalvar = async () => {
    if (!usuarioLogado) return alert("Faça login!");
    if (!nome || !descricao || imagensBase64.length === 0) return alert("Preencha os campos!");
    try {
      await addDoc(collection(db, 'produtos'), {
        nome, marca, preco, moeda,
        description: descricao,
        stars: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)), 
        linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`,
        imagens: imagensBase64,
        imagemPrincipal: imagensBase64[0],
        criadoEm: new Date(),
        autor: usuarioLogado.displayName,
        autorId: usuarioLogado.uid
      });
      alert("Postado!");
      setIsModalOpen(false);
      limparCampos();
      buscarProdutos(); 
    } catch (e) { alert("Erro ao salvar."); }
  };

  const limparCampos = () => {
    setNome(''); setMarca(''); setPreco(''); setDescricao(''); setNota('5'); setLinkCompra(''); setImagensBase64([]);
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Excluir esta avaliação?")) {
      try {
        await deleteDoc(doc(db, 'produtos', id));
        setSelectedProduct(null);
        buscarProdutos();
      } catch (e) { alert("Erro ao excluir."); }
    }
  };

  const nextImageZoom = (e) => {
    e.stopPropagation();
    const imagens = selectedProduct.imagens;
    setCurrentImgIndex((prev) => (prev + 1) % imagens.length);
  };

  const prevImageZoom = (e) => {
    e.stopPropagation();
    const imagens = selectedProduct.imagens;
    setCurrentImgIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const formatarMoeda = (valor, tipoMoeda) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    const simbolos = { BRL: 'R$ ', USD: '$ ', EUR: '€ ' };
    return simbolos[tipoMoeda] + v;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setIsLoginModalOpen(false);
    } catch (e) { alert("Erro no login."); }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (senha !== confirmarSenha) return alert("Senhas não conferem.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(userCredential.user, { displayName: nomeCompleto });
      setIsRegisterModalOpen(false);
    } catch (e) { alert("Erro ao cadastrar."); }
  };

  const minhasAvaliacoes = produtos.filter(p => p.autorId === usuarioLogado?.uid);

  return (
    <Container>
      <style>{animacaoStyles}</style>
      <Header>
        <div onClick={() => setTelaAtiva('home')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src={logoImg} alt="Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <span onClick={() => {setTelaAtiva('perfil'); setAbaPerfil('dados');}} style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
                Olá, {usuarioLogado.displayName}
              </span>
              <button onClick={() => signOut(auth)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>Sair</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsLoginModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
              <button onClick={() => setIsRegisterModalOpen(true)} style={{ background: 'white', color: '#2563eb', border: '2px solid #2563eb', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Cadastrar</button>
            </>
          )}
        </div>
      </Header>

      {telaAtiva === 'home' ? (
        <>
          <Hero>
            <h1>Avaliações Reais de Eletrônicos</h1>
            <SearchContainer>
              <Button onClick={() => usuarioLogado ? setIsModalOpen(true) : alert("Faça login!")}>+ Avaliar Produto</Button>
              <InputBusca 
                placeholder="Buscar produtos ou marcas..." 
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)} 
              />
            </SearchContainer>
          </Hero>

          {/* GRADE DE MARCAS (ESTÁTICA E CINZA) */}
          <div style={{ background: 'white', padding: '40px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px', justifyItems: 'center' }}>
              {nomesMarcas.map((nome, index) => (
                <span key={index} style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8', transition: '0.3s', cursor: 'default' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  {nome}
                </span>
              ))}
            </div>
          </div>

          <SectionTitle>{termoBusca ? `Resultados para "${termoBusca}"` : "Últimas avaliações"}</SectionTitle>
          <ReviewsContainer>
            {produtosFiltrados.map(p => (
              <ProductCard key={p.id} onClick={() => { setSelectedProduct(p); setCurrentImgIndex(0); }} style={{ transition: '0.3s' }}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo>
                  <h3>{p.nome}</h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>Por: {p.autor}</p>
                  <Stars>{p.stars}</Stars> 
                </ProductInfo>
              </ProductCard>
            ))}
            {produtosFiltrados.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px' }}>Nenhum produto encontrado.</p>}
          </ReviewsContainer>
        </>
      ) : (
        <div style={{ minHeight: 'calc(100vh - 80px)', background: '#2563eb', padding: '40px 20px' }}>
          <div className="anima-modal" style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '30px' }}>
            <h2>Minha Conta</h2>
            <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #f1f5f9', marginBottom: '25px' }}>
              <button onClick={() => setAbaPerfil('dados')} style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: abaPerfil === 'dados' ? '3px solid #2563eb' : 'none', fontWeight: 'bold' }}>Dados Pessoais</button>
              <button onClick={() => setAbaPerfil('minhas-avaliacoes')} style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: abaPerfil === 'minhas-avaliacoes' ? '3px solid #2563eb' : 'none', fontWeight: 'bold' }}>Minhas Avaliações</button>
            </div>
            {abaPerfil === 'dados' ? (
              <div>
                <p><strong>Nome:</strong> {usuarioLogado?.displayName}</p>
                <p><strong>E-mail:</strong> {usuarioLogado?.email}</p>
                <button onClick={() => setTelaAtiva('home')} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', marginTop: '20px', cursor: 'pointer' }}>Voltar</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                {minhasAvaliacoes.map(p => (
                  <div key={p.id} onClick={() => {setSelectedProduct(p); setCurrentImgIndex(0);}} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
                    <img src={p.imagemPrincipal} style={{ width: '100%', borderRadius: '5px' }} />
                    <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>{p.nome}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoomImage && (
        <ModalOverlay className="anima-overlay" onClick={() => setZoomImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 5000 }}>
          <div className="anima-modal" style={{ position: 'relative', width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={prevImageZoom} style={{ position: 'absolute', left: '10px', background: 'white', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>‹</button>
            <img src={selectedProduct.imagens[currentImgIndex]} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            <button onClick={nextImageZoom} style={{ position: 'absolute', right: '10px', background: 'white', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>›</button>
            <button onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '0', right: '10px', color: 'white', background: 'none', border: 'none', fontSize: '40px', cursor: 'pointer' }}>×</button>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL DETALHES (LAYOUT OPOSTO + "X") */}
      {selectedProduct && (
        <ModalOverlay className="anima-overlay" onClick={() => setSelectedProduct(null)}>
          <ProductModalContent className="anima-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', paddingTop: '40px' }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b' }}>×</button>
            
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
              {selectedProduct.imagens.map((img, idx) => (
                <img key={idx} src={img} onClick={() => { setZoomImage(true); setCurrentImgIndex(idx); }} style={{ height: '150px', borderRadius: '10px', cursor: 'zoom-in', border: currentImgIndex === idx ? '3px solid #2563eb' : 'none' }} />
              ))}
            </div>
            <h2>{selectedProduct.nome}</h2>
            <Stars>{selectedProduct.stars}</Stars>
            <p style={{ margin: '15px 0', lineHeight: '1.6' }}>{selectedProduct.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <BuyButton href={selectedProduct.linkCompra} target="_blank" style={{ margin: 0 }}>Ver Produto</BuyButton>
                {usuarioLogado?.uid === selectedProduct.autorId && (
                    <button onClick={() => handleExcluir(selectedProduct.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Excluir Avaliação</button>
                )}
            </div>
          </ProductModalContent>
        </ModalOverlay>
      )}

      {/* MODAL POSTAGEM */}
      {isModalOpen && (
        <ModalOverlay className="anima-overlay"><ModalContent className="anima-modal">
          <h2>Nova Avaliação</h2>
          <FormInput placeholder="Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
          <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={moeda} onChange={(e) => setMoeda(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <option value="BRL">R$</option><option value="EUR">€</option><option value="USD">$</option>
            </select>
            <FormInput style={{ flex: 1 }} placeholder="Preço" value={preco} onChange={(e) => setPreco(formatarMoeda(e.target.value, moeda))} />
          </div>
          <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />
          <select value={nota} onChange={(e) => setNota(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <option value="5">5 Estrelas</option><option value="4">4 Estrelas</option><option value="3">3 Estrelas</option>
          </select>
          <textarea placeholder="Descrição..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }} />
          <input type="file" multiple onChange={handleFileChange} />
          <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
            {imagensBase64.map((img, i) => <img key={i} src={img} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />)}
          </div>
          <ActionButton onClick={handleSalvar} style={{ marginTop: '15px' }}>Postar Avaliação</ActionButton>
          <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {/* MODAIS DE LOGIN E CADASTRO */}
      {isLoginModalOpen && (
        <ModalOverlay className="anima-overlay"><ModalContent className="anima-modal">
          <h2>Entrar</h2>
          <FormInput type="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
          <FormInput type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />
          <ActionButton onClick={handleLogin}>Entrar</ActionButton>
          <CloseButton onClick={() => setIsLoginModalOpen(false)}>Fechar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {isRegisterModalOpen && (
        <ModalOverlay className="anima-overlay"><ModalContent className="anima-modal">
          <h2>Criar Conta</h2>
          <FormInput placeholder="Nome Completo" onChange={(e) => setNomeCompleto(e.target.value)} />
          <FormInput type="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
          <FormInput type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />
          <FormInput type="password" placeholder="Confirmar Senha" onChange={(e) => setConfirmarSenha(e.target.value)} />
          <ActionButton onClick={handleCadastro}>Cadastrar</ActionButton>
          <CloseButton onClick={() => setIsRegisterModalOpen(false)}>Voltar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

    </Container>
  );
}

export default Home;