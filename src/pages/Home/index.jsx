import { useState, useEffect } from 'react';
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

  const [produtos, setProdutos] = useState(() => {
    const salvos = localStorage.getItem('@olhaOProduto:produtos');
    return salvos ? JSON.parse(salvos) : [
      {
        id: 1,
        nome: 'iPhone 15 Pro Max',
        marca: 'Apple',
        preco: 'R$ 8.000,00',
        description: 'A câmera é espetacular.',
        imagem: 'https://m.media-amazon.com/images/I/71657UrTiIL._AC_SL1500_.jpg',
        estrelas: '★★★★★',
        linkCompra: 'https://www.apple.com/br/'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('@olhaOProduto:produtos', JSON.stringify(produtos));
  }, [produtos]);

  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [imagem, setImagem] = useState('');
  const [linkCompra, setLinkCompra] = useState('');

  const formatarMoeda = (valor) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return "R$ " + v;
  };

  const handleSalvar = () => {
    if (!nome || !marca || !descricao) return alert("Preencha os campos!");
    const novoProduto = {
      id: Date.now(),
      nome, marca, 
      preco: preco || 'R$ 0,00',
      description: descricao,
      imagem: imagem || 'https://via.placeholder.com/150',
      estrelas: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)),
      linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`
    };
    setProdutos([novoProduto, ...produtos]);
    setIsModalOpen(false);
    setNome(''); setMarca(''); setPreco(''); setDescricao(''); setImagem(''); setLinkCompra('');
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>👁️ Olha o Produto</div>
      </Header>

      <Hero>
        <h1>Avaliações Reais de Eletrônicos</h1>
        <SearchContainer>
          <Button onClick={() => setIsModalOpen(true)}>+ Avaliar Produto</Button>
          <InputBusca placeholder="Buscar..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
        </SearchContainer>
      </Hero>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Nova Avaliação</h2>
            <FormInput placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
            <FormInput placeholder="Preço" value={preco} onChange={(e) => setPreco(formatarMoeda(e.target.value))} />
            <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />
            <textarea placeholder="Sua opinião..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px' }} />
            <ActionButton onClick={handleSalvar}>Publicar</ActionButton>
            <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      <SectionTitle>Últimos avaliados</SectionTitle>
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
            <img src={selectedProduct.imagem} style={{ width: '100%', borderRadius: '10px' }} />
            <p>{selectedProduct.description}</p>
            <h3 style={{ color: '#2563eb' }}>{selectedProduct.preco}</h3>
            <BuyButton href={selectedProduct.linkCompra} target="_blank">Ver na Loja</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)}>Voltar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;