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
  // --- ESTADOS DE PRODUTOS E BUSCA ---
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // --- ESTADOS DE NAVEGAÇÃO E MODAIS ---
  const [telaAtiva, setTelaAtiva] = useState('home'); 
  const [abaPerfil, setAbaPerfil] = useState('dados'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // --- ESTADOS DE ZOOM E GALERIA ---
  const [zoomImage, setZoomImage] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // --- ESTADOS DE USUÁRIO ---
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [moeda, setMoeda] = useState('BRL'); 
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [linkCompra, setLinkCompra] = useState('');
  const [imagensBase64, setImagensBase64] = useState([]);

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

  // COMPRESSÃO DE IMAGEM
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

  // NAVEGAÇÃO DA GALERIA DE ZOOM
  const nextImageZoom = (e) => {
    e.stopPropagation(); // Impede que o clique no botão feche o modal
    const imagens = selectedProduct.imagens;
    setCurrentImgIndex((prev) => (prev + 1) % imagens.length);
  };

  const prevImageZoom = (e) => {
    e.stopPropagation(); // Impede que o clique no botão feche o modal
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
      <Header>
        <div onClick={() => setTelaAtiva('home')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src={logoImg} alt="Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <span onClick={() => setTelaAtiva('perfil')} style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
                Olá, {usuarioLogado.displayName}
              </span>
              <button onClick={() => signOut(auth)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
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
              <InputBusca placeholder="Buscar produtos..." onChange={(e) => setTermoBusca(e.target.value)} />
            </SearchContainer>
          </Hero>

          <SectionTitle>Últimas avaliações</SectionTitle>
          <ReviewsContainer>
            {produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase())).map(p => (
              <ProductCard key={p.id} onClick={() => { setSelectedProduct(p); setCurrentImgIndex(0); }}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo>
                  <h3>{p.nome}</h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>Por: {p.autor}</p>
                  <Stars>{p.stars}</Stars> 
                </ProductInfo>
              </ProductCard>
            ))}
          </ReviewsContainer>
        </>
      ) : (
        /* TELA DE PERFIL */
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2>Minha Conta</h2>
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', marginTop: '15px' }}>
            <button onClick={() => setAbaPerfil('dados')} style={{ padding: '10px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: abaPerfil === 'dados' ? '2px solid #2563eb' : 'none', fontWeight: 'bold', color: abaPerfil === 'dados' ? '#2563eb' : '#64748b' }}>Dados</button>
            <button onClick={() => setAbaPerfil('minhas-avaliacoes')} style={{ padding: '10px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: abaPerfil === 'minhas-avaliacoes' ? '2px solid #2563eb' : 'none', fontWeight: 'bold', color: abaPerfil === 'minhas-avaliacoes' ? '#2563eb' : '#64748b' }}>Minhas Avaliações</button>
          </div>
          {abaPerfil === 'dados' ? (
            <div style={{ lineHeight: '2' }}>
              <p><strong>Nome:</strong> {usuarioLogado?.displayName}</p>
              <p><strong>E-mail:</strong> {usuarioLogado?.email}</p>
              <button onClick={() => setTelaAtiva('home')} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>Voltar</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {minhasAvaliacoes.map(p => (
                <div key={p.id} onClick={() => {setSelectedProduct(p); setCurrentImgIndex(0);}} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}>
                  <img src={p.imagemPrincipal} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
                  <h4 style={{ fontSize: '12px', marginTop: '5px' }}>{p.nome}</h4>
                </div>
              ))}
              {minhasAvaliacoes.length === 0 && <p>Você ainda não fez avaliações.</p>}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE DETALHES COM MINIATURAS E ZOOM */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
              {selectedProduct.imagens.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  onClick={() => { setZoomImage(true); setCurrentImgIndex(idx); }} 
                  style={{ height: '150px', borderRadius: '10px', cursor: 'zoom-in', border: currentImgIndex === idx ? '2px solid #2563eb' : 'none' }} 
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{selectedProduct.nome}</h2>
              {usuarioLogado?.uid === selectedProduct.autorId && (
                <button onClick={() => handleExcluir(selectedProduct.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
              )}
            </div>
            <Stars>{selectedProduct.stars}</Stars>
            <p style={{ margin: '15px 0', lineHeight: '1.6' }}>{selectedProduct.description}</p>
            <BuyButton href={selectedProduct.linkCompra} target="_blank">Ver Produto</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)}>Fechar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}

      {/* ZOOM MODAL RESTAURADO COM SETAS E SEM TEXTO */}
      {zoomImage && (
        <ModalOverlay onClick={() => setZoomImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 5000 }}>
          <div style={{ position: 'relative', width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Seta Esquerda */}
            <button 
              onClick={prevImageZoom} 
              style={{ position: 'absolute', left: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 5010 }}
            >
              ‹
            </button>
            
            <img src={selectedProduct.imagens[currentImgIndex]} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            
            {/* Seta Direita */}
            <button 
              onClick={nextImageZoom} 
              style={{ position: 'absolute', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 5010 }}
            >
              ›
            </button>

            {/* Botão Fechar (X) no topo */}
            <button 
              onClick={() => setZoomImage(null)} 
              style={{ position: 'absolute', top: '-10px', right: '10px', color: 'white', background: 'none', border: 'none', fontSize: '40px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ×
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL DE POSTAGEM */}
      {isModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Nova Avaliação</h2>
          <FormInput placeholder="Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
          <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={moeda} onChange={(e) => setMoeda(e.target.value)} style={{ padding: '10px', borderRadius: '8px' }}>
              <option value="BRL">R$</option><option value="EUR">€</option><option value="USD">$</option>
            </select>
            <FormInput style={{ flex: 1 }} placeholder="Preço" value={preco} onChange={(e) => setPreco(formatarMoeda(e.target.value, moeda))} />
          </div>
          <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />
          <select value={nota} onChange={(e) => setNota(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option value="5">5 Estrelas</option><option value="4">4 Estrelas</option><option value="3">3 Estrelas</option>
          </select>
          <textarea placeholder="Descrição..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', marginBottom: '10px' }} />
          <input type="file" multiple onChange={handleFileChange} />
          <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
            {imagensBase64.map((img, i) => <img key={i} src={img} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />)}
          </div>
          <ActionButton onClick={handleSalvar} style={{ marginTop: '15px' }}>Postar</ActionButton>
          <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Entrar</h2>
          <FormInput type="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
          <FormInput type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />
          <ActionButton onClick={handleLogin}>Entrar</ActionButton>
          <CloseButton onClick={() => setIsLoginModalOpen(false)}>Fechar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {/* MODAL CADASTRO */}
      {isRegisterModalOpen && (
        <ModalOverlay><ModalContent>
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