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

// --- APENAS O LOGO É IMPORTADO AQUI ---
import logoImg from '../../assets/logo.png'; 

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
  const [telaAtiva, setTelaAtiva] = useState('home'); 
  const [abaPerfil, setAbaPerfil] = useState('dados'); 
  const [zoomImage, setZoomImage] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

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
    } catch (error) { console.error(error); }
  };

  // --- FUNÇÃO PARA COMPRIMIR IMAGENS (Resolve o "Erro ao Salvar") ---
  const comprimirImagem = (base64Str) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Limita a largura para reduzir o tamanho do arquivo
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Salva como JPEG com 70% de qualidade
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
    if (!nome || !descricao || imagensBase64.length === 0) return alert("Preencha os campos obrigatórios!");

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
      alert("Sucesso!");
      setIsModalOpen(false);
      limparCampos();
      buscarProdutos(); 
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar. Tente subir fotos menores ou menos fotos.");
    }
  };

  const limparCampos = () => {
    setNome(''); setMarca(''); setPreco(''); setDescricao(''); setNota('5'); setLinkCompra(''); setImagensBase64([]);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setIsLoginModalOpen(false);
    } catch (e) { alert("Erro no login."); }
  };

  return (
    <Container>
      <Header>
        <div onClick={() => setTelaAtiva('home')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img 
            src={logoImg} 
            alt="Logo" 
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <span onClick={() => setTelaAtiva('perfil')} style={{ fontSize: '14px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
                Olá, {usuarioLogado.displayName}
              </span>
              <button onClick={() => signOut(auth)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}>Sair</button>
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
            {produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase())).map(p => (
              <ProductCard key={p.id} onClick={() => { setSelectedProduct(p); setCurrentImgIndex(0); }}>
                <ProductImage src={p.imagemPrincipal} />
                <ProductInfo>
                  <h3>{p.nome}</h3>
                  <Stars>{p.stars}</Stars> 
                </ProductInfo>
              </ProductCard>
            ))}
          </ReviewsContainer>
        </>
      ) : (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '15px' }}>
          <h2>Minha Conta: {usuarioLogado?.displayName}</h2>
          <button onClick={() => setTelaAtiva('home')} style={{ marginTop: '20px', cursor: 'pointer' }}>Voltar para Home</button>
        </div>
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
            {imagensBase64.map((img, i) => <img key={i} src={img} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />)}
          </div>
          <ActionButton onClick={handleSalvar} style={{ marginTop: '15px' }}>Postar Avaliação</ActionButton>
          <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <ModalOverlay><ModalContent>
          <h2>Entrar</h2>
          <FormInput type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormInput type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <ActionButton onClick={handleLogin}>Entrar</ActionButton>
          <CloseButton onClick={() => setIsLoginModalOpen(false)}>Fechar</CloseButton>
        </ModalContent></ModalOverlay>
      )}

      {/* MODAL DETALHES */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <img src={selectedProduct.imagens[currentImgIndex]} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            <h2>{selectedProduct.nome}</h2>
            <Stars>{selectedProduct.stars}</Stars>
            <p>{selectedProduct.description}</p>
            <BuyButton href={selectedProduct.linkCompra} target="_blank">Ver Produto</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)}>Fechar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;