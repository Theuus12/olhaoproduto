import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { 
  Container, Header, Hero, SearchContainer, InputBusca, 
  SectionTitle, ReviewsContainer, ProductCard, ProductImage, 
  ProductInfo, Stars, ModalOverlay, ModalContent, FormInput, 
  FilterButton, EvalButton, FormTextArea, FormSelect, PostButton, CancelButton,
  LoginButton, RegisterButton, LogoutButton, ProfileTabs, TabButton,
  ModalFieldGroup, UploadPhotoContainer, PhotoPreviewGrid,
  ProductGallery, GalleryImage, GalleryArrow, GalleryPosition
} from './styles';

const demoCatalog = [
  { id: 'demo-iphone-15-pro', nome: 'iPhone 15 Pro', marca: 'Apple', categoria: 'Celulares', preco: '7.499,00', moeda: 'R$', stars: '★★★★★', description: 'Desempenho rápido, câmera versátil e acabamento em titânio num formato confortável.', imagemPrincipal: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-galaxy-s24-ultra', nome: 'Galaxy S24 Ultra', marca: 'Samsung', categoria: 'Celulares', preco: '6.899,00', moeda: 'R$', stars: '★★★★★', description: 'Tela ampla, conjunto de câmeras avançado e recursos de produtividade integrados.', imagemPrincipal: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-iphone-14', nome: 'iPhone 14', marca: 'Apple', categoria: 'Celulares', preco: '3.899,00', moeda: 'R$', stars: '★★★★☆', description: 'Um celular equilibrado para fotos, comunicação e uso diário.', imagemPrincipal: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-redmi-note-13', nome: 'Redmi Note 13 Pro', marca: 'Xiaomi', categoria: 'Celulares', preco: '2.199,00', moeda: 'R$', stars: '★★★★☆', description: 'Tela vibrante, carregamento rápido e bastante espaço para aplicativos e fotos.', imagemPrincipal: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-motorola-edge-50', nome: 'Edge 50 Pro', marca: 'Motorola', categoria: 'Celulares', preco: '3.499,00', moeda: 'R$', stars: '★★★★☆', description: 'Design fino com tela fluida e carregamento de alta velocidade.', imagemPrincipal: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-galaxy-a55', nome: 'Galaxy A55 5G', marca: 'Samsung', categoria: 'Celulares', preco: '2.499,00', moeda: 'R$', stars: '★★★★☆', description: 'Boa autonomia, tela AMOLED e conectividade 5G para o dia a dia.', imagemPrincipal: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-iphone-13', nome: 'iPhone 13', marca: 'Apple', categoria: 'Celulares', preco: '3.299,00', moeda: 'R$', stars: '★★★★☆', description: 'Desempenho consistente e câmera dupla num aparelho compacto.', imagemPrincipal: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-pixel-8', nome: 'Pixel 8', marca: 'Google', categoria: 'Celulares', preco: '4.299,00', moeda: 'R$', stars: '★★★★★', description: 'Android fluido, recursos inteligentes e fotografia computacional detalhada.', imagemPrincipal: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-galaxy-z-flip5', nome: 'Galaxy Z Flip5', marca: 'Samsung', categoria: 'Celulares', preco: '4.799,00', moeda: 'R$', stars: '★★★★☆', description: 'Formato dobrável compacto com tela externa útil para tarefas rápidas.', imagemPrincipal: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-xiaomi-13t', nome: 'Xiaomi 13T', marca: 'Xiaomi', categoria: 'Celulares', preco: '3.199,00', moeda: 'R$', stars: '★★★★☆', description: 'Tela de alta taxa de atualização e câmeras versáteis para foto e vídeo.', imagemPrincipal: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-macbook-air', nome: 'MacBook Air M3', marca: 'Apple', categoria: 'Notebooks', preco: '10.999,00', moeda: 'R$', stars: '★★★★★', description: 'Notebook leve e silencioso com ótima autonomia para estudo e trabalho.', imagemPrincipal: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-dell-xps', nome: 'XPS 13', marca: 'Dell', categoria: 'Notebooks', preco: '9.499,00', moeda: 'R$', stars: '★★★★★', description: 'Construção premium e tela de alta definição num corpo compacto.', imagemPrincipal: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-thinkpad-e14', nome: 'ThinkPad E14', marca: 'Lenovo', categoria: 'Notebooks', preco: '5.799,00', moeda: 'R$', stars: '★★★★☆', description: 'Teclado confortável e configuração pensada para produtividade.', imagemPrincipal: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-zenbook-14', nome: 'Zenbook 14 OLED', marca: 'ASUS', categoria: 'Notebooks', preco: '7.299,00', moeda: 'R$', stars: '★★★★☆', description: 'Tela OLED contrastada e perfil leve para levar na mochila.', imagemPrincipal: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-hp-pavilion', nome: 'Pavilion 15', marca: 'HP', categoria: 'Notebooks', preco: '4.899,00', moeda: 'R$', stars: '★★★★☆', description: 'Notebook de uso geral com tela ampla e configuração equilibrada.', imagemPrincipal: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-sony-xm5', nome: 'WH-1000XM5', marca: 'Sony', categoria: 'Áudio', preco: '2.199,00', moeda: 'R$', stars: '★★★★★', description: 'Fone sem fio com cancelamento de ruído e conforto para longas sessões.', imagemPrincipal: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-airpods-pro', nome: 'AirPods Pro 2', marca: 'Apple', categoria: 'Áudio', preco: '1.899,00', moeda: 'R$', stars: '★★★★★', description: 'Fones compactos com áudio espacial e cancelamento de ruído adaptativo.', imagemPrincipal: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-jbl-flip', nome: 'Flip 6', marca: 'JBL', categoria: 'Áudio', preco: '699,00', moeda: 'R$', stars: '★★★★☆', description: 'Caixa Bluetooth portátil com som potente e proteção para uso ao ar livre.', imagemPrincipal: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-logitech-pro-x', nome: 'G Pro X', marca: 'Logitech', categoria: 'Periféricos', preco: '899,00', moeda: 'R$', stars: '★★★★☆', description: 'Headset para jogos com microfone destacável e áudio posicional.', imagemPrincipal: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-mx-master', nome: 'MX Master 3S', marca: 'Logitech', categoria: 'Periféricos', preco: '649,00', moeda: 'R$', stars: '★★★★★', description: 'Mouse ergonômico com rolagem precisa e botões personalizáveis.', imagemPrincipal: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-keychron-k2', nome: 'Keychron K2', marca: 'Logitech', categoria: 'Periféricos', preco: '579,00', moeda: 'R$', stars: '★★★★☆', description: 'Teclado mecânico compacto com conexão sem fio e iluminação ajustável.', imagemPrincipal: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-razer-blackwidow', nome: 'BlackWidow V4', marca: 'Razer', categoria: 'Periféricos', preco: '1.099,00', moeda: 'R$', stars: '★★★★☆', description: 'Teclado mecânico com resposta rápida e iluminação por tecla.', imagemPrincipal: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-dell-ultrasharp', nome: 'UltraSharp 27 4K', marca: 'Dell', categoria: 'Monitores', preco: '3.299,00', moeda: 'R$', stars: '★★★★★', description: 'Monitor 4K com cores precisas para trabalho, criação e entretenimento.', imagemPrincipal: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-odyssey-g5', nome: 'Odyssey G5 32"', marca: 'Samsung', categoria: 'Monitores', preco: '2.499,00', moeda: 'R$', stars: '★★★★☆', description: 'Monitor curvo de alta frequência para jogos e uso multimédia.', imagemPrincipal: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-ssd-990pro', nome: '990 Pro 1 TB', marca: 'Samsung', categoria: 'Hardware', preco: '899,00', moeda: 'R$', stars: '★★★★★', description: 'SSD NVMe de alto desempenho para acelerar inicialização e carregamentos.', imagemPrincipal: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-ram-crucial', nome: 'Memória DDR5 32 GB', marca: 'Dell', categoria: 'Hardware', preco: '749,00', moeda: 'R$', stars: '★★★★☆', description: 'Kit de memória para multitarefa e montagem de computadores atuais.', imagemPrincipal: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-webcam-c920', nome: 'C920 HD Pro', marca: 'Logitech', categoria: 'Periféricos', preco: '429,00', moeda: 'R$', stars: '★★★★☆', description: 'Webcam Full HD com foco automático para reuniões e transmissões.', imagemPrincipal: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-canon-r50', nome: 'EOS R50', marca: 'Canon', categoria: 'Fotografia', preco: '5.299,00', moeda: 'R$', stars: '★★★★★', description: 'Câmera mirrorless leve para fotografia e vídeo em alta resolução.', imagemPrincipal: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-sony-a6400', nome: 'Alpha a6400', marca: 'Sony', categoria: 'Fotografia', preco: '6.199,00', moeda: 'R$', stars: '★★★★☆', description: 'Câmera mirrorless compacta com foco automático rápido e gravação 4K.', imagemPrincipal: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-gopro-hero', nome: 'HERO 12 Black', marca: 'GoPro', categoria: 'Fotografia', preco: '2.799,00', moeda: 'R$', stars: '★★★★☆', description: 'Câmera de ação resistente com estabilização para atividades e viagens.', imagemPrincipal: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
  { id: 'demo-kindle-paperwhite', nome: 'Kindle Paperwhite', marca: 'Amazon', categoria: 'Tablets', preco: '799,00', moeda: 'R$', stars: '★★★★★', description: 'Leitor digital leve, com tela antirreflexo e bateria de longa duração.', imagemPrincipal: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85', autorId: 'catalogo' },
];

const catalogPhotos = [...new Set(demoCatalog.map((product) => product.imagemPrincipal))];
const demoProducts = demoCatalog.map((product, productIndex) => {
  const gallery = demoCatalog
    .filter((candidate) => candidate.categoria === product.categoria && candidate.id !== product.id)
    .map((candidate) => candidate.imagemPrincipal)
    .filter((image, index, images) => image !== product.imagemPrincipal && images.indexOf(image) === index);

  for (let offset = 1; gallery.length < 2 && offset < catalogPhotos.length; offset += 1) {
    const image = catalogPhotos[(productIndex + offset) % catalogPhotos.length];
    if (image !== product.imagemPrincipal && !gallery.includes(image)) gallery.push(image);
  }

  return { ...product, imagens: [product.imagemPrincipal, ...gallery.slice(0, 2)] };
});

const productImages = (product) => [...new Set([product.imagemPrincipal, ...(Array.isArray(product.imagens) ? product.imagens : [])].filter(Boolean))];

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [telaAtiva, setTelaAtiva] = useState('home'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null); // Para abrir o detalhe
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

  const marcas = ['Amazon', 'Apple', 'ASUS', 'Canon', 'Dell', 'GoPro', 'Google', 'HP', 'JBL', 'Lenovo', 'Logitech', 'Motorola', 'Razer', 'Samsung', 'Sony', 'Xiaomi'].sort();
  const categorias = ['Áudio', 'Celulares', 'Fotografia', 'Hardware', 'Monitores', 'Notebooks', 'Periféricos', 'Tablets'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUsuarioLogado(user));
    buscarProdutos();
    return () => unsubscribe();
  }, []);

  const buscarProdutos = async () => {
    try {
      const q = query(collection(db, 'produtos'), orderBy('criadoEm', 'desc'));
      const snapshot = await getDocs(q);
      setProdutos([...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), ...demoProducts]);
    } catch (error) {
      console.error('Não foi possível carregar avaliações da comunidade:', error);
      setProdutos(demoProducts);
    }
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
    const matchesBusca = p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || p.marca.toLowerCase().includes(termoBusca.toLowerCase());
    const matchesMarca = filtroAtivoMarca ? p.marca === filtroAtivoMarca : true;
    const matchesCategoria = filtroAtivoCategoria ? p.categoria === filtroAtivoCategoria : true;
    return matchesBusca && matchesMarca && matchesCategoria;
  });

  return (
    <Container>
      <Header>
        <div onClick={() => setTelaAtiva('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-lockup" aria-label="Olha o Produto">
            <span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M8 5.5h17.5L34 14v20H8V5.5Z" fill="url(#brandGradient)"/><path d="M24.5 5.5V14H34" fill="#fff" fillOpacity=".27"/><circle cx="19.5" cy="21" r="6.5" stroke="white" strokeWidth="2.6"/><path d="m24.5 26 5 5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/><defs><linearGradient id="brandGradient" x1="8" y1="5.5" x2="34" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#A78BFA"/><stop offset="1" stopColor="#6D5DFC"/></linearGradient></defs></svg></span>
            <span className="brand-name">olha<span>o</span>produto</span>
          </div>
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
            <div className="hero-copy"><span className="eyebrow">GUIA DE COMPRAS DA COMUNIDADE</span><h1>Escolha melhor.<br /><span>Compre com confian&ccedil;a.</span></h1><p>Opini&otilde;es reais e recomenda&ccedil;&otilde;es para encontrar o pr&oacute;ximo eletr&ocirc;nico favorito.</p></div>
            <SearchContainer>
              <InputBusca placeholder="Buscar produtos, marcas..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
              <FilterButton onClick={() => setIsFilterModalOpen(true)}>Filtros</FilterButton>
              <EvalButton onClick={() => usuarioLogado ? setIsModalOpen(true) : setIsLoginModalOpen(true)}>+ Avaliar produto</EvalButton>
            </SearchContainer>
          </Hero>
          <SectionTitle>Em destaque <small>{produtosFiltrados.length} produtos</small></SectionTitle>
          <ReviewsContainer>
            {produtosFiltrados.map(p => (
              <ProductCard key={p.id} onClick={() => { setSelectedProduct(p); setSelectedImageIndex(0); }}>
                <ProductImage src={p.imagemPrincipal} alt={p.nome} loading="lazy" />
                <ProductInfo>
                  <div className="product-meta"><span>{p.categoria}</span><Stars>{p.stars}</Stars></div>
                  <h3>{p.nome}</h3><p className="product-brand">{p.marca}</p>
                  {p.preco && <strong className="product-price">{p.moeda === 'BRL' ? 'R$' : p.moeda || 'R$'} {p.preco}</strong>}
                  {(p.autorId === usuarioLogado?.uid || !p.autorId) && (
                    <button onClick={(e) => excluirAvaliacao(e, p.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer', marginTop:'10px'}}>Excluir</button>
                  )}
                </ProductInfo>
              </ProductCard>
            ))}
            {produtosFiltrados.length === 0 && <p className="empty-state">Nenhum produto encontrado. Tente outra busca ou limpe os filtros.</p>}
          </ReviewsContainer>
        </>
      ) : (
        /* TELA DE PERFIL RESUMIDA */
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: '#141827', color: '#f1f2f7', padding: '30px', borderRadius: '20px', border: '1px solid #ffffff1a' }}>
            <h2>Minhas Avaliações</h2>
            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              {produtos.filter(p => p.autorId === usuarioLogado?.uid).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedProduct(p); setSelectedImageIndex(0); }}
                  style={{padding: '15px', border: '1px solid #ffffff20', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', background: '#0d101b'}}
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
            {(() => {
              const images = productImages(selectedProduct);
              const activeImage = images[selectedImageIndex] || images[0];
              const changeImage = (direction) => setSelectedImageIndex((current) => (current + direction + images.length) % images.length);
              return (
                <ProductGallery>
                  <GalleryImage src={activeImage} alt={`${selectedProduct.nome} - imagem ${selectedImageIndex + 1}`} />
                  {images.length > 1 && <>
                    <GalleryArrow type="button" aria-label="Imagem anterior" onClick={() => changeImage(-1)}>&#x2039;</GalleryArrow>
                    <GalleryArrow type="button" aria-label="Próxima imagem" $right onClick={() => changeImage(1)}>&#x203A;</GalleryArrow>
                    <GalleryPosition>{selectedImageIndex + 1} / {images.length}</GalleryPosition>
                  </>}
                </ProductGallery>
              );
            })()}
            <h2 style={{marginTop: '20px'}}>{selectedProduct.nome}</h2>
            <Stars>{selectedProduct.stars}</Stars>
            <p><strong>Marca:</strong> {selectedProduct.marca} | <strong>Categoria:</strong> {selectedProduct.categoria}</p>
            <p><strong>Preço:</strong> {selectedProduct.moeda} {selectedProduct.preco}</p>
            <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #eee'}} />
            <p>{selectedProduct.description}</p>
            {selectedProduct.linkCompra && (
              <a href={selectedProduct.linkCompra} target="_blank" rel="noreferrer" style={{display: 'block', marginTop: '15px', color: '#b7a2ff', fontWeight: 'bold'}}>Ver Link de Compra</a>
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
