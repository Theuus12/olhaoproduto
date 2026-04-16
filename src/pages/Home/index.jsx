import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Container, Header, Hero, Button, SearchContainer, InputBusca, 
  SectionTitle, ReviewsContainer, ProductCard, ProductImage, 
  ProductInfo, Stars, ModalOverlay, ProductModalContent, 
  BuyButton, ModalContent, FormInput, ActionButton, CloseButton 
} from './styles';

function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [produtos, setProdutos] = useState([]);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [linkCompra, setLinkCompra] = useState('');

  // BUSCAR DADOS NO FIREBASE
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

  useEffect(() => {
    buscarProdutos();
  }, []);

  const handleSalvar = async () => {
    if (!nome || !marca || !descricao) return alert("Preencha os campos obrigatórios!");
    
    try {
      await addDoc(collection(db, 'produtos'), {
        nome, marca, preco, description: descricao,
        estrelas: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)),
        linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`,
        imagem: 'https://via.placeholder.com/150?text=Produto',
        criadoEm: new Date()
      });
      
      setIsModalOpen(false);
      setNome(''); setMarca(''); setPreco(''); setDescricao('');
      buscarProdutos(); // Recarrega a lista
    } catch (e) {
      alert("Erro ao salvar no Firebase: " + e.message);
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <Container>
      <Header><div style={{ fontWeight: 'bold', fontSize: '20px' }}>👁️ Olha o Produto</div></Header>
      
      <Hero>
        <h1>Avaliações Reais (Firebase Cloud)</h1>
        <SearchContainer>
          <Button onClick={() => setIsModalOpen(true)}>+ Avaliar Produto</Button>
          <InputBusca placeholder="Buscar no banco..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
        </SearchContainer>
      </Hero>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Nova Avaliação</h2>
            <FormInput placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
            <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
            <FormInput placeholder="Preço (ex: R$ 50,00)" value={preco} onChange={(e) => setPreco(e.target.value)} />
            <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />
            <textarea placeholder="Sua opinião..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px' }} />
            <ActionButton onClick={handleSalvar}>Salvar na Nuvem</ActionButton>
            <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      <SectionTitle>Feed de Avaliações</SectionTitle>
      <ReviewsContainer>
        {produtosFiltrados.map(p => (
          <ProductCard key={p.id} onClick={() => setSelectedProduct(p)}>
            <ProductImage src={p.imagem} />
            <ProductInfo>
              <h3>{p.nome}</h3>
              <Stars>{p.estrelas}</Stars>
            </ProductInfo>
          </ProductCard>
        ))}
      </ReviewsContainer>

      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <h2>{selectedProduct.nome}</h2>
            <p style={{ margin: '20px 0' }}>{selectedProduct.description}</p>
            <BuyButton href={selectedProduct.linkCompra} target="_blank">Ver Produto</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)} style={{ marginTop: '10px' }}>Fechar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;