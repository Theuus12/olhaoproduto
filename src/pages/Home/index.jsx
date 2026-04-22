import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import logoImg from '../../assets/logo.png'; 

import { 
  Container, Header, Hero, SearchContainer, InputBusca, 
  SectionTitle, ReviewsContainer, ProductCard, ProductImage, 
  ProductInfo, Stars, ModalOverlay, ModalContent, FormInput, 
  FilterButton, EvalButton, FormTextArea, FormSelect, PostButton, CancelButton,
  LoginButton, RegisterButton, LogoutButton, ProfileTabs, TabButton,
  ModalFieldGroup, UploadPhotoContainer, PhotoPreviewGrid
} from './styles';

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [telaAtiva, setTelaAtiva] = useState('home'); 
  const [abaPerfil, setAbaPerfil] = useState('dados'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); 
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Estados Form Avaliação
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('Samsung');
  const [categoria, setCategoria] = useState('Celulares');
  const [preco, setPreco] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [linkCompra, setLinkCompra] = useState('');
  const [imagensBase64, setImagensBase64] = useState([]);

  // Estados Login/Cadastro
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  const marcas = ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Xiaomi', 'Logitech', 'Razer'].sort();
  const categorias = ['Celulares', 'Notebooks', 'Eletrodomésticos', 'Monitores', 'Periféricos', 'Hardware', 'Áudio'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUsuarioLogado(user));
    buscarProdutos();
    return () => unsubscribe();
  }, []);

  const buscarProdutos = async () => {
    const q = query(collection(db, 'produtos'), orderBy('criadoEm', 'desc'));
    const snapshot = await getDocs(q);
    setProdutos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagensBase64(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleSalvarAvaliacao = async () => {
    if (!nome || !descricao || imagensBase64.length === 0) return alert("Preencha os dados e adicione ao menos uma foto!");
    try {
      await addDoc(collection(db, 'produtos'), {
        nome, marca, categoria, preco, moeda,
        description: descricao,
        stars: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)),
        linkCompra,
        imagens: imagensBase64,
        imagemPrincipal: imagensBase64[0],
        autorId: usuarioLogado.uid,
        autorNome: usuarioLogado.displayName,
        criadoEm: new Date()
      });
      setIsModalOpen(false);
      resetForm();
      buscarProdutos();
    } catch (e) { alert("Erro ao postar."); }
  };

  const resetForm = () => {
    setNome(''); setDescricao(''); setImagensBase64([]); setPreco(''); setLinkCompra('');
  };

  const handleLogin = async () => {
    try { await signInWithEmailAndPassword(auth, email, senha); setIsLoginModalOpen(false); } catch (e) { alert("Erro no login"); }
  };

  const handleCadastro = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(userCred.user, { displayName: nomeCompleto });
      setIsRegisterModalOpen(false);
    } catch (e) { alert("Erro no cadastro"); }
  };

  const handleLogout = async () => { await signOut(auth); setTelaAtiva('home'); };

  const produtosFiltrados = produtos.filter(p => {
    const matchesMarca = filtroAtivo ? p.marca === filtroAtivo : true;
    const matchesBusca = p.nome.toLowerCase().includes(termoBusca.toLowerCase());
    return matchesMarca && matchesBusca;
  });

  return (
    <Container>
      <Header>
        <div onClick={() => setTelaAtiva('home')} style={{ cursor: 'pointer' }}>
          <img src={logoImg} alt="Logo" style={{ height: '40px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <LoginButton onClick={() => setTelaAtiva('perfil')}>Olá, {usuarioLogado.displayName?.split(' ')[0]}</LoginButton>
              <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
            </>
          ) : (
            <>
              <LoginButton onClick={() => setIsLoginModalOpen(true)}>Entrar</LoginButton>
              <RegisterButton onClick={() => setIsRegisterModalOpen(true)}>Cadastrar</RegisterButton>
            </>
          )}
        </div>
      </Header>

      {telaAtiva === 'home' ? (
        <>
          <Hero>
            <h1>Avaliações Reais de Eletrônicos</h1>
            <SearchContainer>
              <EvalButton onClick={() => usuarioLogado ? setIsModalOpen(true) : setIsLoginModalOpen(true)}>+ Avaliar Produto</EvalButton>
              <InputBusca placeholder="Buscar produtos ou marcas..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
              <FilterButton onClick={() => setIsFilterModalOpen(true)}>🔍 Filtros</FilterButton>
            </SearchContainer>
          </Hero>

          <SectionTitle>{filtroAtivo ? `Filtrando por ${filtroAtivo}` : "Últimas avaliações"}</SectionTitle>

          <ReviewsContainer>
            {produtosFiltrados.map(p => (
              <ProductCard key={p.id}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo><h3>{p.nome}</h3><Stars>{p.stars}</Stars></ProductInfo>
              </ProductCard>
            ))}
          </ReviewsContainer>
        </>
      ) : (
        /* TELA DE PERFIL RESTAURADA (DADOS + MINHAS AVALIAÇÕES) */
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2>Minha Conta</h2>
            <ProfileTabs>
              <TabButton active={abaPerfil === 'dados'} onClick={() => setAbaPerfil('dados')}>Dados Pessoais</TabButton>
              <TabButton active={abaPerfil === 'minhas'} onClick={() => setAbaPerfil('minhas')}>Minhas Avaliações</TabButton>
            </ProfileTabs>
            
            {abaPerfil === 'dados' ? (
               <div style={{ lineHeight: '2' }}>
                 <p><strong>Nome:</strong> {usuarioLogado?.displayName}</p>
                 <p><strong>E-mail:</strong> {usuarioLogado?.email}</p>
               </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {produtos.filter(p => p.autorId === usuarioLogado?.uid).length > 0 ? (
                  produtos.filter(p => p.autorId === usuarioLogado?.uid).map(p => (
                    <div key={p.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{p.nome}</span>
                      <Stars>{p.stars}</Stars>
                    </div>
                  ))
                ) : <p>Você ainda não postou nenhuma avaliação.</p>}
              </div>
            )}
            <CancelButton onClick={() => setTelaAtiva('home')} style={{ marginTop: '30px' }}>Voltar para a Home</CancelButton>
          </div>
        </div>
      )}

      {/* MODAL AVALIAÇÃO (EURO INCLUÍDO) */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Nova Avaliação</h2>
            <FormInput placeholder="Nome do Produto" value={nome} onChange={e => setNome(e.target.value)} />
            <ModalFieldGroup>
              <FormSelect value={marca} onChange={e => setMarca(e.target.value)}>
                {marcas.map(m => <option key={m} value={m}>{m}</option>)}
              </FormSelect>
              <FormSelect value={categoria} onChange={e => setCategoria(e.target.value)}>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
            </ModalFieldGroup>
            <ModalFieldGroup>
              <FormInput placeholder="Preço" type="number" value={preco} onChange={e => setPreco(e.target.value)} />
              <FormSelect value={moeda} onChange={e => setMoeda(e.target.value)}>
                <option value="BRL">R$ (BRL)</option>
                <option value="USD">$ (USD)</option>
                <option value="EUR">€ (EUR)</option>
              </FormSelect>
            </ModalFieldGroup>
            <FormSelect value={nota} onChange={e => setNota(e.target.value)}>
              <option value="5">5 Estrelas (Excelente)</option>
              <option value="4">4 Estrelas (Muito Bom)</option>
              <option value="3">3 Estrelas (Bom)</option>
              <option value="2">2 Estrelas (Regular)</option>
              <option value="1">1 Estrela (Ruim)</option>
            </FormSelect>
            <FormTextArea placeholder="O que você achou?" value={descricao} onChange={e => setDescricao(e.target.value)} />
            <FormInput placeholder="Link de compra (Opcional)" value={linkCompra} onChange={e => setLinkCompra(e.target.value)} />
            <UploadPhotoContainer>
              <label htmlFor="file-upload">⊕ Adicionar Fotos</label>
              <input id="file-upload" type="file" multiple onChange={handleFileChange} accept="image/*" />
            </UploadPhotoContainer>
            <PhotoPreviewGrid>
              {imagensBase64.map((img, i) => <img key={i} src={img} alt="Preview" />)}
            </PhotoPreviewGrid>
            <PostButton onClick={handleSalvarAvaliacao}>Publicar</PostButton>
            <CancelButton onClick={() => setIsModalOpen(false)}>Cancelar</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAIS DE LOGIN, CADASTRO E FILTRO */}
      {isLoginModalOpen && (
        <ModalOverlay onClick={() => setIsLoginModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Entrar</h2>
            <FormInput placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
            <FormInput type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
            <PostButton onClick={handleLogin}>Entrar</PostButton>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {isRegisterModalOpen && (
        <ModalOverlay onClick={() => setIsRegisterModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Criar Conta</h2>
            <FormInput placeholder="Nome Completo" onChange={e => setNomeCompleto(e.target.value)} />
            <FormInput placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
            <FormInput type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
            <PostButton onClick={handleCadastro}>Cadastrar</PostButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isFilterModalOpen && (
        <ModalOverlay onClick={() => setIsFilterModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Filtrar Marcas</h2>
            <FormSelect value={marcaFiltro} onChange={e => setMarcaFiltro(e.target.value)}>
              <option value="">Todas</option>
              {marcas.map(m => <option key={m} value={m}>{m}</option>)}
            </FormSelect>
            <PostButton onClick={() => { setFiltroAtivo(marcaFiltro); setIsFilterModalOpen(false); }}>Filtrar</PostButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;