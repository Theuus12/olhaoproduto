import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
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

  // Estado para monitorar o usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Estados do Cadastro/Login
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState(''); // NOVO ESTADO
  const [lembrar, setLembrar] = useState(false);

  // Estados do Produto
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

    const emailSalvo = localStorage.getItem('@olhaOProduto:email');
    const senhaSalva = localStorage.getItem('@olhaOProduto:senha');
    if (emailSalvo && senhaSalva) {
      setEmail(emailSalvo);
      setSenha(senhaSalva);
      setLembrar(true);
    }
    
    buscarProdutos();
    return () => unsubscribe();
  }, []);

  const formatarMoeda = (valor, tipoMoeda) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    const simbolos = { BRL: 'R$ ', USD: '$ ', EUR: '€ ' };
    return simbolos[tipoMoeda] + v;
  };

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
    if (!email || !senha) return alert("Preencha e-mail e senha!");
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      if (lembrar) {
        localStorage.setItem('@olhaOProduto:email', email);
        localStorage.setItem('@olhaOProduto:senha', senha);
      } else {
        localStorage.removeItem('@olhaOProduto:email');
        localStorage.removeItem('@olhaOProduto:senha');
      }
      setIsLoginModalOpen(false);
    } catch (error) {
      alert("Erro ao entrar: Verifique suas credenciais.");
    }
  };

  // FUNÇÃO DE CADASTRO COM CONFIRMAÇÃO DE SENHA
  const handleCadastro = async (e) => {
    e.preventDefault();
    if (!nomeCompleto || !email || !senha || !confirmarSenha) {
      return alert("Preencha todos os campos!");
    }

    if (senha !== confirmarSenha) {
      return alert("As senhas não coincidem!");
    }

    if (senha.length < 6) {
      return alert("A senha deve ter pelo menos 6 caracteres!");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(userCredential.user, { displayName: nomeCompleto });
      alert(`Bem-vindo, ${nomeCompleto}!`);
      setIsRegisterModalOpen(false);
      setConfirmarSenha(''); // Limpa o campo de confirmação
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    alert("Você saiu da conta.");
  };

  const handleAbrirModalAvaliacao = () => {
    if (!usuarioLogado) return alert("Você precisa estar logado para avaliar um produto!");
    setIsModalOpen(true);
  };

  const handleSalvar = async () => {
    if (!usuarioLogado) return alert("Ação não permitida. Faça login primeiro.");
    if (!nome || !marca || !descricao || imagensBase64.length === 0) {
      return alert("Preencha os campos obrigatórios e adicione ao menos uma imagem!");
    }
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
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>👁️ Olha o Produto</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {usuarioLogado ? (
            <>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Olá, {usuarioLogado.displayName}</span>
              <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>Sair</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsLoginModalOpen(true)} style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>Entrar</button>
              <button onClick={() => setIsRegisterModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>Cadastrar</button>
            </>
          )}
        </div>
      </Header>
      
      <Hero>
        <h1>Avaliações Reais de Eletrônicos</h1>
        <SearchContainer>
          <Button onClick={handleAbrirModalAvaliacao}>+ Avaliar Produto</Button>
          <InputBusca placeholder="Buscar produtos..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
        </SearchContainer>
      </Hero>

      {/* MODAL DE LOGIN */}
      {isLoginModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Acesse sua conta</h2>
            <FormInput type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormInput type="password" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', width: '100%' }}>
              <input type="checkbox" id="lembrar" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
              <label htmlFor="lembrar" style={{ fontSize: '14px', color: '#64748b' }}>Lembrar login</label>
            </div>
            <ActionButton onClick={handleLogin}>Entrar</ActionButton>
            <CloseButton onClick={() => setIsLoginModalOpen(false)}>Cancelar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL DE CADASTRO COM CONFIRMAÇÃO */}
      {isRegisterModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Crie sua conta</h2>
            <FormInput placeholder="Nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
            <FormInput type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormInput type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <FormInput type="password" placeholder="Confirme sua senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
            <ActionButton onClick={handleCadastro}>Cadastrar</ActionButton>
            <CloseButton onClick={() => setIsRegisterModalOpen(false)}>Voltar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL DE AVALIAÇÃO */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Nova Avaliação</h2>
            <FormInput placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
            <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select value={moeda} onChange={(e) => { setMoeda(e.target.value); setPreco(''); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                <option value="BRL">R$ (Real)</option>
                <option value="USD">$ (Dólar)</option>
                <option value="EUR">€ (Euro)</option>
              </select>
              <FormInput style={{ marginBottom: 0, flex: 1 }} placeholder={`Preço em ${moeda}`} value={preco} onChange={(e) => setPreco(formatarMoeda(e.target.value, moeda))} />
            </div>

            <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />

            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Sua nota:</label>
              <select value={nota} onChange={(e) => setNota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }}>
                <option value="5">5 Estrelas</option>
                <option value="4">4 Estrelas</option>
                <option value="3">3 Estrelas</option>
                <option value="2">2 Estrelas</option>
                <option value="1">1 Estrela</option>
              </select>
            </div>

            <textarea placeholder="Sua opinião..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />

            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <label htmlFor="file-upload" style={{ display: 'inline-block', padding: '10px 15px', cursor: 'pointer', background: '#f1f5f9', color: '#64748b', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}>📷 Adicionar Fotos</label>
              <input id="file-upload" type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
                {imagensBase64.map((img, index) => (
                  <img key={index} src={img} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }} />
                ))}
              </div>
            </div>

            <ActionButton onClick={handleSalvar}>Adicionar Avaliação</ActionButton>
            <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      <SectionTitle>Últimas avaliações</SectionTitle>
      <ReviewsContainer>
        {produtosFiltrados.map(p => (
          <ProductCard key={p.id} onClick={() => setSelectedProduct(p)}>
            <ProductImage src={p.imagemPrincipal || p.imagens?.[0]} />
            <ProductInfo>
              <h3>{p.nome}</h3>
              <Stars>{p.stars}</Stars> 
            </ProductInfo>
          </ProductCard>
        ))}
      </ReviewsContainer>

      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
             <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
              {(selectedProduct.imagens || [selectedProduct.imagemPrincipal]).map((img, idx) => (
                <img key={idx} src={img} style={{ height: '200px', borderRadius: '10px' }} alt="Produto" />
              ))}
            </div>
            <h2>{selectedProduct.nome}</h2>
            <h3 style={{ color: '#2563eb', margin: '10px 0' }}>{selectedProduct.preco}</h3>
            <p style={{ margin: '20px 0', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>"{selectedProduct.description}"</p>
            <BuyButton href={selectedProduct.linkCompra} target="_blank">Onde Comprar</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)} style={{ marginTop: '10px' }}>Voltar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;