import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'; 
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null); // Para abrir o detalhe
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

  // Estados de Filtro
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [filtroAtivoMarca, setFiltroAtivoMarca] = useState('');
  const [filtroAtivoCategoria, setFiltroAtivoCategoria] = useState('');

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

  const handleSalvarAvaliacao = async () => {
    if (!nome || !descricao || imagensBase64.length === 0) return alert("Preencha os dados e adicione fotos!");
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
    } catch (e) { alert("Erro ao salvar"); }
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

  const excluirAvaliacao = async (e, id) => {
    e.stopPropagation(); // Evita abrir o modal ao clicar em excluir
    if (window.confirm("Remover esta avaliação?")) {
      await deleteDoc(doc(db, 'produtos', id));
      buscarProdutos();
    }
  };

  const produtosFiltrados = produtos.filter(p => {
    const matchesBusca = p.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const matchesMarca = filtroAtivoMarca ? p.marca === filtroAtivoMarca : true;
    const matchesCategoria = filtroAtivoCategoria ? p.categoria === filtroAtivoCategoria : true;
    return matchesBusca && matchesMarca && matchesCategoria;
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
              <LoginButton onClick={() => setTelaAtiva('perfil')}>Olá, {usuarioLogado.displayName}</LoginButton>
              <LogoutButton onClick={() => signOut(auth)}>Sair</LogoutButton>
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
            <h1>Avaliações de Eletrônicos</h1>
            <SearchContainer>
              <EvalButton onClick={() => usuarioLogado ? setIsModalOpen(true) : setIsLoginModalOpen(true)}>+ Avaliar Produto</EvalButton>
              <InputBusca placeholder="Buscar..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
              <FilterButton onClick={() => setIsFilterModalOpen(true)}>🔍 Filtros</FilterButton>
            </SearchContainer>
          </Hero>
          <ReviewsContainer>
            {produtosFiltrados.map(p => (
              <ProductCard key={p.id} onClick={() => setSelectedProduct(p)}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo>
                  <h3>{p.nome}</h3>
                  <Stars>{p.stars}</Stars>
                  {(p.autorId === usuarioLogado?.uid || !p.autorId) && (
                    <button onClick={(e) => excluirAvaliacao(e, p.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer', marginTop:'10px'}}>Excluir</button>
                  )}
                </ProductInfo>
              </ProductCard>
            ))}
          </ReviewsContainer>
        </>
      ) : (
        /* TELA DE PERFIL RESUMIDA */
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px' }}>
            <h2>Minhas Avaliações</h2>
            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              {produtos.filter(p => p.autorId === usuarioLogado?.uid).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProduct(p)}
                  style={{padding: '15px', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}
                >
                  <span>{p.nome}</span>
                  <Stars>{p.stars}</Stars>
                </div>
              ))}
            </div>
            <PostButton onClick={() => setTelaAtiva('home')} style={{marginTop: '30px'}}>Voltar para Home</PostButton>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHE (ABRE AO CLICAR NA AVALIAÇÃO) */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <img src={selectedProduct.imagemPrincipal} style={{width: '100%', borderRadius: '15px', maxHeight: '300px', objectFit: 'contain'}} />
            <h2 style={{marginTop: '20px'}}>{selectedProduct.nome}</h2>
            <Stars>{selectedProduct.stars}</Stars>
            <p><strong>Marca:</strong> {selectedProduct.marca} | <strong>Categoria:</strong> {selectedProduct.categoria}</p>
            <p><strong>Preço:</strong> {selectedProduct.moeda} {selectedProduct.preco}</p>
            <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #eee'}} />
            <p>{selectedProduct.description}</p>
            {selectedProduct.linkCompra && (
              <a href={selectedProduct.linkCompra} target="_blank" rel="noreferrer" style={{display: 'block', marginTop: '15px', color: '#2563eb', fontWeight: 'bold'}}>Ver Link de Compra</a>
            )}
            <CancelButton onClick={() => setSelectedProduct(null)} style={{marginTop: '20px'}}>Fechar</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL FILTRO */}
      {isFilterModalOpen && (
        <ModalOverlay onClick={() => setIsFilterModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Filtrar</h2>
            <FormSelect value={marcaFiltro} onChange={e => setMarcaFiltro(e.target.value)}>
              <option value="">Todas as Marcas</option>
              {marcas.map(m => <option key={m} value={m}>{m}</option>)}
            </FormSelect>
            <FormSelect value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas as Categorias</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </FormSelect>
            <PostButton onClick={() => { setFiltroAtivoMarca(marcaFiltro); setFiltroAtivoCategoria(categoriaFiltro); setIsFilterModalOpen(false); }}>Aplicar</PostButton>
            <CancelButton onClick={() => { setFiltroAtivoMarca(''); setFiltroAtivoCategoria(''); setIsFilterModalOpen(false); }}>Limpar</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL AVALIAÇÃO (COMPLETO) */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Nova Avaliação</h2>
            <FormInput placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
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
              <option value="5">5 Estrelas</option>
              <option value="4">4 Estrelas</option>
              <option value="3">3 Estrelas</option>
              <option value="2">2 Estrelas</option>
              <option value="1">1 Estrela</option>
            </FormSelect>
            <FormTextArea placeholder="Sua opinião..." value={descricao} onChange={e => setDescricao(e.target.value)} />
            <FormInput placeholder="Link de compra (Opcional)" value={linkCompra} onChange={e => setLinkCompra(e.target.value)} />
            <UploadPhotoContainer>
              <label htmlFor="file">⊕ Adicionar Fotos</label>
              <input id="file" type="file" multiple onChange={(e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                  const reader = new FileReader();
                  reader.onloadend = () => setImagensBase64(prev => [...prev, reader.result]);
                  reader.readAsDataURL(file);
                });
              }} />
            </UploadPhotoContainer>
            <PhotoPreviewGrid>
               {imagensBase64.map((img, i) => <img key={i} src={img} style={{width: '50px'}} />)}
            </PhotoPreviewGrid>
            <PostButton onClick={handleSalvarAvaliacao}>Postar</PostButton>
            <CancelButton onClick={() => setIsModalOpen(false)}>Cancelar</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* LOGIN E CADASTRO */}
      {isLoginModalOpen && (
        <ModalOverlay onClick={() => setIsLoginModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Entrar</h2>
            <FormInput placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
            <FormInput type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
            <PostButton onClick={handleLogin}>Entrar</PostButton>
            <CancelButton onClick={() => setIsLoginModalOpen(false)}>Fechar</CancelButton>
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
            <CancelButton onClick={() => setIsRegisterModalOpen(false)}>Fechar</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;