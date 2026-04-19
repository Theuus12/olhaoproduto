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
  Container, Header, Hero, SearchContainer, InputBusca, 
  SectionTitle, ReviewsContainer, ProductCard, ProductImage, 
  ProductInfo, Stars, ModalOverlay, ProductModalContent, 
  BuyButton, ModalContent, FormInput,
  ModalFieldGroup, InputWrapper, FormTextArea, FormSelect,
  UploadPhotoContainer, PhotoPreviewGrid, ModalFooter, PostButton, CancelButton 
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

  // --- ESTADOS DE FILTRO ---
  const [marcaSelecionada, setMarcaSelecionada] = useState(null); 
  const [filtroAtivo, setFiltroAtivo] = useState({ marca: '', categoria: '' });

  // --- ESTADOS USUÁRIO ---
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // --- ESTADOS FORMULÁRIO PRODUTO ---
  const [nome, setNome] = useState('');
  const [marcaPost, setMarcaPost] = useState('Samsung'); 
  const [categoriaPost, setCategoriaPost] = useState('Celulares');
  const [preco, setPreco] = useState('');
  const [moeda, setMoeda] = useState('BRL'); 
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [linkCompra, setLinkCompra] = useState('');
  const [imagensBase64, setImagensBase64] = useState([]);

  // --- LISTAS ---
  const nomesMarcas = [
    'Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Xiaomi', 'Philips', 
    'Logitech', 'Razer', 'Corsair', 'Brastemp', 'Consul', 'Nvidia', 'AMD', 'Intel', 'Xbox', 'PlayStation',
    'Acer', 'MSI', 'Gigabyte', 'HyperX', 'Electrolux', 'Panasonic', 'Bose', 'Sennheiser', 'Canon', 'Nikon'
  ];

  const categorias = ['Celulares', 'Notebooks', 'Eletrodomésticos', 'Monitores', 'Periféricos', 'Hardware', 'Consoles'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUsuarioLogado(user));
    buscarProdutos();
    return () => unsubscribe();
  }, []);

  const buscarProdutos = async () => {
    try {
      const q = query(collection(db, 'produtos'), orderBy('criadoEm', 'desc'));
      const snapshot = await getDocs(q);
      setProdutos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error("Erro ao buscar:", error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setTelaAtiva('home');
  };

  const produtosFiltrados = produtos.filter((p) => {
    const busca = termoBusca.toLowerCase();
    const matchesBusca = p.nome?.toLowerCase().includes(busca) || p.marca?.toLowerCase().includes(busca);
    const matchesMarca = filtroAtivo.marca ? (p.marca === filtroAtivo.marca) : true;
    const matchesCategoria = filtroAtivo.categoria ? (p.categoria === filtroAtivo.categoria) : true;
    return matchesBusca && matchesMarca && matchesCategoria;
  });

  const comprimirImagem = (base64Str) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
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
        nome, marca: marcaPost, categoria: categoriaPost, preco, moeda,
        description: descricao,
        stars: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)), 
        linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`,
        imagens: imagensBase64,
        imagemPrincipal: imagensBase64[0],
        criadoEm: new Date(),
        autor: usuarioLogado.displayName,
        autorId: usuarioLogado.uid
      });
      alert("Avaliação postada com sucesso!");
      setIsModalOpen(false);
      limparCampos();
      buscarProdutos(); 
    } catch (e) { alert("Erro ao salvar."); }
  };

  const limparCampos = () => {
    setNome(''); setMarcaPost('Samsung'); setPreco(''); setDescricao(''); setNota('5'); setLinkCompra(''); setImagensBase64([]); setCategoriaPost('Celulares');
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

  const formatarMoeda = (valor, tipoMoeda) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    const simbolos = { BRL: 'R$ ', USD: '$ ', EUR: '€ ' };
    return simbolos[tipoMoeda] + v;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, senha); setIsLoginModalOpen(false); } catch (e) { alert("Erro no login."); }
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
        <div onClick={() => { setTelaAtiva('home'); setFiltroAtivo({marca:'', categoria:''}); }} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src={logoImg} alt="Logo" style={{ height: '42px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <span onClick={() => {setTelaAtiva('perfil'); setAbaPerfil('dados');}} style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Olá, {usuarioLogado.displayName}</span>
              <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer' }}>Sair</button>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '20px', cursor: 'pointer' }}>Entrar</button>
          )}
        </div>
      </Header>

      {telaAtiva === 'home' ? (
        <>
          <Hero>
            <h1>Avaliações Reais de Eletrônicos</h1>
            <SearchContainer>
              {/* Ajustado para PostButton para evitar o erro de 'Button' não definido */}
              <PostButton onClick={() => usuarioLogado ? setIsModalOpen(true) : alert("Faça login!")} style={{maxWidth: '200px'}}>+ Avaliar Produto</PostButton>
              <InputBusca placeholder="Buscar produtos ou marcas..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
            </SearchContainer>
          </Hero>

          <div style={{ background: 'white', padding: '40px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '20px', justifyItems: 'center' }}>
              {nomesMarcas.map((m) => (
                <span key={m} className="brand-item" style={{ fontSize: '15px', fontWeight: '600', color: '#94a3b8', transition: '0.3s', cursor: 'pointer' }} onClick={() => setMarcaSelecionada(m)}>{m}</span>
              ))}
            </div>
          </div>

          <SectionTitle>
            {filtroAtivo.marca ? `Exibindo: ${filtroAtivo.marca} > ${filtroAtivo.categoria}` : "Últimas avaliações"}
            {filtroAtivo.marca && <span onClick={() => setFiltroAtivo({marca:'', categoria:''})} style={{fontSize: '12px', marginLeft: '10px', color: '#ef4444', cursor: 'pointer'}}>(Limpar Filtro)</span>}
          </SectionTitle>

          <ReviewsContainer>
            {produtosFiltrados.map(p => (
              <ProductCard key={p.id} onClick={() => { setSelectedProduct(p); setCurrentImgIndex(0); }}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo>
                  <h3>{p.nome}</h3>
                  <p style={{fontSize:'11px', color:'#94a3b8'}}>{p.marca} | {p.categoria || 'Geral'}</p>
                  <Stars>{p.stars}</Stars> 
                </ProductInfo>
              </ProductCard>
            ))}
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
                <PostButton onClick={() => setTelaAtiva('home')} style={{ marginTop: '20px', maxWidth: '200px' }}>Voltar para Home</PostButton>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                {minhasAvaliacoes.length > 0 ? (
                  minhasAvaliacoes.map(p => (
                    <div key={p.id} onClick={() => {setSelectedProduct(p); setCurrentImgIndex(0);}} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
                      <img src={p.imagemPrincipal} style={{ width: '100%', borderRadius: '5px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>{p.nome}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#64748b', marginBottom: '15px' }}>Você ainda não fez nenhuma avaliação.</p>
                    <PostButton onClick={() => { setTelaAtiva('home'); setIsModalOpen(true); }} style={{maxWidth:'300px', margin:'0 auto'}}>Fazer minha primeira avaliação</PostButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CATEGORIAS (MARCAS) */}
      {marcaSelecionada && (
        <ModalOverlay onClick={() => setMarcaSelecionada(null)} style={{zIndex: 2000}}>
          <ModalContent onClick={e => e.stopPropagation()} style={{maxWidth: '400px'}}>
            <h3>Categorias {marcaSelecionada}</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px'}}>
              {categorias.map(cat => (
                <div key={cat} style={{padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'center'}} onClick={() => { setFiltroAtivo({ marca: marcaSelecionada, categoria: cat }); setMarcaSelecionada(null); }}>{cat}</div>
              ))}
            </div>
            <CancelButton onClick={() => setMarcaSelecionada(null)} style={{marginTop: '15px'}}>Fechar</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL DETALHES COM ZOOM */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}>×</button>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
              {selectedProduct.imagens.map((img, idx) => (
                <img key={idx} src={img} onClick={() => { setZoomImage(true); setCurrentImgIndex(idx); }} style={{ height: '120px', borderRadius: '10px', cursor: 'zoom-in', border: currentImgIndex === idx ? '3px solid #2563eb' : 'none' }} />
              ))}
            </div>
            <h2>{selectedProduct.nome}</h2>
            <Stars>{selectedProduct.stars}</Stars>
            <p style={{ margin: '15px 0' }}>{selectedProduct.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <BuyButton href={selectedProduct.linkCompra} target="_blank">Ver Produto</BuyButton>
                {usuarioLogado?.uid === selectedProduct.autorId && (
                    <button onClick={() => handleExcluir(selectedProduct.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer' }}>Excluir</button>
                )}
            </div>
          </ProductModalContent>
        </ModalOverlay>
      )}

      {/* MODAL CRIAR AVALIAÇÃO - LAYOUT PROFISSIONAL */}
      {isModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Nova Avaliação</h2>
          
          <InputWrapper>
            <label>Nome do Produto:</label>
            <FormInput placeholder="Ex: Monitor Gamer 24 Pol" value={nome} onChange={(e) => setNome(e.target.value)} />
          </InputWrapper>
          
          <ModalFieldGroup>
            <InputWrapper>
              <label>Marca:</label>
              <FormSelect value={marcaPost} onChange={(e) => setMarcaPost(e.target.value)}>
                {nomesMarcas.sort().map(m => <option key={m} value={m}>{m}</option>)}
              </FormSelect>
            </InputWrapper>

            <InputWrapper>
              <label>Categoria:</label>
              <FormSelect value={categoriaPost} onChange={(e) => setCategoriaPost(e.target.value)}>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
            </InputWrapper>
          </ModalFieldGroup>

          <ModalFieldGroup style={{ gridTemplateColumns: '80px 1fr' }}>
            <InputWrapper>
              <label>Moeda:</label>
              <FormSelect value={moeda} onChange={(e) => setMoeda(e.target.value)}>
                  <option value="BRL">R$</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
              </FormSelect>
            </InputWrapper>
            <InputWrapper>
              <label>Preço:</label>
              <FormInput placeholder="0,00" value={preco} onChange={(e) => setPreco(formatarMoeda(e.target.value, moeda))} />
            </InputWrapper>
          </ModalFieldGroup>

          <InputWrapper>
            <label>Link de Compra:</label>
            <FormInput placeholder="https://..." value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />
          </InputWrapper>
          
          <InputWrapper>
            <label>Sua Nota:</label>
            <FormSelect value={nota} onChange={(e) => setNota(e.target.value)}>
                <option value="5">★★★★★ Excelente</option>
                <option value="4">★★★★☆ Muito Bom</option>
                <option value="3">★★★☆☆ Bom</option>
                <option value="2">★★☆☆☆ Regular</option>
                <option value="1">★☆☆☆☆ Ruim</option>
            </FormSelect>
          </InputWrapper>

          <InputWrapper>
            <label>Descrição:</label>
            <FormTextArea placeholder="O que achou do produto?" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </InputWrapper>
          
          <UploadPhotoContainer>
            <label htmlFor="file-upload">
              <span style={{fontSize: '24px'}}>⊕</span>
              <p>{imagensBase64.length > 0 ? `${imagensBase64.length} fotos selecionadas` : "Adicionar Fotos"}</p>
            </label>
            <input id="file-upload" type="file" multiple onChange={handleFileChange} accept="image/*" />
            <PhotoPreviewGrid>
              {imagensBase64.map((img, i) => <img key={i} src={img} alt="preview" />)}
            </PhotoPreviewGrid>
          </UploadPhotoContainer>

          <ModalFooter>
              <PostButton onClick={handleSalvar}>Postar Avaliação</PostButton>
              <CancelButton onClick={() => setIsModalOpen(false)}>Cancelar</CancelButton>
          </ModalFooter>
        </ModalContent></ModalOverlay>
      )}

      {/* MODAIS LOGIN E CADASTRO */}
      {isLoginModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Entrar</h2>
          <FormInput placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} style={{marginBottom:'10px'}} />
          <FormInput type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} style={{marginBottom:'15px'}} />
          <PostButton onClick={handleLogin} style={{width:'100%'}}>Entrar</PostButton>
          <CancelButton onClick={() => setIsLoginModalOpen(false)} style={{width:'100%', marginTop:'10px'}}>Fechar</CancelButton>
          <p style={{fontSize:'12px', textAlign:'center', marginTop:'15px', cursor:'pointer', color:'#2563eb'}} onClick={() => {setIsLoginModalOpen(false); setIsRegisterModalOpen(true);}}>Não tem conta? Cadastre-se</p>
        </ModalContent></ModalOverlay>
      )}

      {isRegisterModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Criar Conta</h2>
          <FormInput placeholder="Nome Completo" onChange={(e) => setNomeCompleto(e.target.value)} style={{marginBottom:'10px'}} />
          <FormInput placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} style={{marginBottom:'10px'}} />
          <FormInput type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} style={{marginBottom:'10px'}} />
          <FormInput type="password" placeholder="Confirmar Senha" onChange={(e) => setConfirmarSenha(e.target.value)} style={{marginBottom:'15px'}} />
          <PostButton onClick={handleCadastro} style={{width:'100%'}}>Cadastrar</PostButton>
          <CancelButton onClick={() => setIsRegisterModalOpen(false)} style={{width:'100%', marginTop:'10px'}}>Voltar</CancelButton>
        </ModalContent></ModalOverlay>
      )}

      {/* ZOOM MODAL */}
      {zoomImage && (
        <ModalOverlay onClick={() => setZoomImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 5000 }}>
          <img src={selectedProduct.imagens[currentImgIndex]} style={{ maxHeight: '90%', maxWidth: '90%' }} alt="Zoom" />
        </ModalOverlay>
      )}

    </Container>
  );
}

export default Home;