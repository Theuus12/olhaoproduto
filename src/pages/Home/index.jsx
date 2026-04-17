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
import { 
  Container, Header, Hero, Button, SearchContainer, InputBusca, 
  SectionTitle, ReviewsContainer, ProductCard, ProductImage, 
  ProductInfo, Stars, ModalOverlay, ProductModalContent, 
  BuyButton, ModalContent, FormInput, ActionButton, CloseButton 
} from './styles';

function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [produtos, setProdutos] = useState([]);
  
  // ESTADOS DE ZOOM DA IMAGEM
  const [zoomImage, setZoomImage] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // NAVEGAÇÃO
  const [telaAtiva, setTelaAtiva] = useState('home'); 
  const [abaPerfil, setAbaPerfil] = useState('dados'); 

  // USUÁRIO
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // PRODUTO
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
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }
  };

  // FUNÇÃO PARA EXCLUIR AVALIAÇÃO
  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta avaliação?")) {
      try {
        await deleteDoc(doc(db, 'produtos', id));
        alert("Avaliação excluída!");
        setSelectedProduct(null);
        buscarProdutos();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  // NAVEGAÇÃO DA GALERIA DE ZOOM
  const nextImage = (e) => {
    e.stopPropagation();
    const imagens = selectedProduct.imagens || [selectedProduct.imagemPrincipal];
    setCurrentImgIndex((prev) => (prev + 1) % imagens.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const imagens = selectedProduct.imagens || [selectedProduct.imagemPrincipal];
    setCurrentImgIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const formatarMoeda = (valor, tipoMoeda) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    const simbolos = { BRL: 'R$ ', USD: '$ ', EUR: '€ ' };
    return simbolos[tipoMoeda] + v;
  };

  const handleFileChange = (e) => {
    const arquivos = Array.from(e.target.files);
    arquivos.forEach(arquivo => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagensBase64((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(arquivo);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setIsLoginModalOpen(false);
    } catch (error) { alert("Erro ao entrar."); }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (senha !== confirmarSenha) return alert("Senhas diferentes!");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(userCredential.user, { displayName: nomeCompleto });
      setIsRegisterModalOpen(false);
    } catch (error) { alert("Erro ao cadastrar."); }
  };

  const handleSalvar = async () => {
    if (!usuarioLogado) return alert("Logue primeiro!");
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
      setIsModalOpen(false);
      setNome(''); setMarca(''); setPreco(''); setDescricao(''); setNota('5'); setLinkCompra(''); setImagensBase64([]);
      buscarProdutos(); 
    } catch (e) { alert("Erro ao salvar."); }
  };

  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));
  const minhasAvaliacoes = produtos.filter(p => p.autorId === usuarioLogado?.uid);

  return (
    <Container>
      <Header>
        <div onClick={() => setTelaAtiva('home')} style={{ fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>👁️ Olha o Produto</div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <span onClick={() => setTelaAtiva('perfil')} style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
                Olá, {usuarioLogado.displayName}
              </span>
              <button onClick={() => signOut(auth)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer' }}>Sair</button>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}>Entrar</button>
          )}
        </div>
      </Header>

      {telaAtiva === 'home' ? (
        <>
          <Hero>
            <h1>Avaliações Reais de Eletrônicos</h1>
            <SearchContainer>
              <Button onClick={() => usuarioLogado ? setIsModalOpen(true) : alert("Faça login!")}>+ Avaliar Produto</Button>
              <InputBusca placeholder="Buscar produtos..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
            </SearchContainer>
          </Hero>

          <SectionTitle>Últimas avaliações</SectionTitle>
          <ReviewsContainer>
            {produtosFiltrados.map(p => (
              <ProductCard key={p.id} onClick={() => { setSelectedProduct(p); setCurrentImgIndex(0); }}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo>
                  <h3>{p.nome}</h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>Por: {p.autor || 'Anônimo'}</p>
                  <Stars>{p.stars}</Stars> 
                </ProductInfo>
              </ProductCard>
            ))}
          </ReviewsContainer>
        </>
      ) : (
        /* PERFIL */
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Minha Conta</h2>
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <button onClick={() => setAbaPerfil('dados')} style={{ padding: '10px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: abaPerfil === 'dados' ? '2px solid #2563eb' : 'none', fontWeight: 'bold' }}>Dados da Conta</button>
            <button onClick={() => setAbaPerfil('minhas-avaliacoes')} style={{ padding: '10px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: abaPerfil === 'minhas-avaliacoes' ? '2px solid #2563eb' : 'none', fontWeight: 'bold' }}>Minhas Avaliações</button>
          </div>
          {abaPerfil === 'minhas-avaliacoes' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {minhasAvaliacoes.map(p => (
                <div key={p.id} onClick={() => {setSelectedProduct(p); setCurrentImgIndex(0);}} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', cursor: 'pointer', position: 'relative' }}>
                  <img src={p.imagemPrincipal} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
                  <h4 style={{ fontSize: '13px', margin: '5px 0' }}>{p.nome}</h4>
                </div>
              ))}
            </div>
          ) : (
            <div><p><strong>Nome:</strong> {usuarioLogado?.displayName}</p><p><strong>E-mail:</strong> {usuarioLogado?.email}</p></div>
          )}
        </div>
      )}

      {/* MODAL DE DETALHES COM EXCLUIR E ZOOM */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            {/* GALERIA DE FOTOS MINIATURA */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
                {(selectedProduct.imagens || [selectedProduct.imagemPrincipal]).map((img, idx) => (
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
                {/* BOTÃO EXCLUIR (SÓ APARECE SE FOR O DONO) */}
                {usuarioLogado?.uid === selectedProduct.autorId && (
                    <button 
                      onClick={() => handleExcluir(selectedProduct.id)}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🗑️ Excluir
                    </button>
                )}
            </div>
            
            <p style={{ color: '#2563eb', fontWeight: 'bold' }}>Avaliado por: {selectedProduct.autor}</p>
            <Stars>{selectedProduct.stars}</Stars>
            <h3 style={{ margin: '10px 0' }}>{selectedProduct.preco}</h3>
            <p style={{ margin: '15px 0', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>{selectedProduct.description}</p>
            
            <BuyButton href={selectedProduct.linkCompra} target="_blank">Onde Comprar</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)} style={{ marginTop: '10px' }}>Voltar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}

      {/* MODAL DE ZOOM (IMAGEM CHEIA COM SETAS) */}
      {zoomImage && (
        <ModalOverlay onClick={() => setZoomImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 2000 }}>
          <div style={{ position: 'relative', width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={prevImage} style={{ position: 'absolute', left: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>‹</button>
            
            <img 
              src={(selectedProduct.imagens || [selectedProduct.imagemPrincipal])[currentImgIndex]} 
              style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }} 
            />
            
            <button onClick={nextImage} style={{ position: 'absolute', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>›</button>
            <button onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '-20px', right: '10px', color: 'white', background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer' }}>×</button>
          </div>
        </ModalOverlay>
      )}

      {/* MODAIS DE LOGIN/CADASTRO/POSTAR (MANTIDOS IGUAIS) */}
      {isLoginModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Acesse sua conta</h2>
          <FormInput type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormInput type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <ActionButton onClick={handleLogin}>Entrar</ActionButton>
          <CloseButton onClick={() => setIsLoginModalOpen(false)}>Cancelar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {isRegisterModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Crie sua conta</h2>
          <FormInput placeholder="Nome" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
          <FormInput type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormInput type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <FormInput type="password" placeholder="Confirmar" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
          <ActionButton onClick={handleCadastro}>Cadastrar</ActionButton>
          <CloseButton onClick={() => setIsRegisterModalOpen(false)}>Voltar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {isModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Nova Avaliação</h2>
          <FormInput placeholder="Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
          <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={moeda} onChange={(e) => setMoeda(e.target.value)} style={{ padding: '10px', borderRadius: '8px' }}>
              <option value="BRL">R$</option><option value="USD">$</option>
            </select>
            <FormInput style={{ flex: 1 }} placeholder="Preço" value={preco} onChange={(e) => setPreco(formatarMoeda(e.target.value, moeda))} />
          </div>
          <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />
          <select value={nota} onChange={(e) => setNota(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option value="5">5 Estrelas</option><option value="4">4 Estrelas</option><option value="3">3 Estrelas</option>
          </select>
          <textarea placeholder="Opinião" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px' }} />
          <input type="file" multiple onChange={handleFileChange} />
          <ActionButton onClick={handleSalvar}>Postar</ActionButton>
          <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
        </ModalContent></ModalOverlay>
      )}
    </Container>
  );
}

export default Home;