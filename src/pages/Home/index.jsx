import { useState, useEffect } from 'react'; // Adicionado useEffect
import { 
  Container, Header, Hero, Button, SearchContainer, InputBusca, 
  BrandSection, BrandGrid, BrandName, SectionTitle, 
  ReviewsContainer, ProductCard, ProductImage, ProductInfo, Stars, 
  ModalOverlay, ProductModalContent, ModalHeader, CarouselWrapper, 
  BuyButton, ModalContent, FormInput, ActionButton, CloseButton 
} from './styles';

function Home() {
  const [estaAberto, setEstaAberto] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  // --- PERSISTÊNCIA (LocalStorage) ---
  const [produtos, setProdutos] = useState(() => {
    const salvos = localStorage.getItem('@olhaOProduto:produtos');
    return salvos ? JSON.parse(salvos) : [
      {
        id: 1,
        nome: 'iPhone 15 Pro Max - Apple',
        marca: 'Apple',
        preco: 'R$ 8.000,00',
        description: 'A câmera é espetacular e o acabamento em titânio deixou o celular muito mais leve.',
        imagem: 'https://m.media-amazon.com/images/I/71657UrTiIL._AC_SL1500_.jpg',
        estrelas: '★★★★★',
        linkCompra: 'https://www.apple.com/br/iphone-15-pro/'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('@olhaOProduto:produtos', JSON.stringify(produtos));
  }, [produtos]);

  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [imagem, setImagem] = useState('');
  const [linkCompra, setLinkCompra] = useState('');

  // --- FUNÇÕES ---
  const formatarMoeda = (valor) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return "R$ " + v;
  };

  const handlePrecoChange = (e) => setPreco(formatarMoeda(e.target.value));

  const handleImageChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => { setImagem(reader.result); };
      reader.readAsDataURL(arquivo);
    }
  };

  const handleSalvar = () => {
    if (!nome || !marca || !descricao) return alert("Preencha Nome, Marca e sua Avaliação!");

    const novoProduto = {
      id: Date.now(),
      nome,
      marca,
      preco: preco || 'R$ 0,00',
      description: descricao,
      imagem: imagem || 'https://via.placeholder.com/150?text=Sem+Foto',
      estrelas: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)),
      linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`
    };

    setProdutos([novoProduto, ...produtos]);
    setNome(''); setMarca(''); setPreco(''); setDescricao(''); setNota('5'); setImagem(''); setLinkCompra('');
    setIsModalOpen(false);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
    p.marca.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>👁️ Olha o Produto</div>
        <button onClick={() => setEstaAberto(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}>Entrar</button>
      </Header>

      <Hero>
        <h1>Avaliações Reais de Eletrônicos</h1>
        <SearchContainer>
          <Button onClick={() => setIsModalOpen(true)}>+ Avaliar Produto</Button>
          <InputBusca 
            placeholder="Buscar produtos..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </SearchContainer>
      </Hero>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Avaliar Produto</h2>
            <FormInput placeholder="Nome do produto" value={nome} onChange={(e) => setNome(e.target.value)} />
            <FormInput placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
            <FormInput placeholder="Preço" value={preco} onChange={handlePrecoChange} />
            <FormInput placeholder="Link para compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '13px', color: '#64748b' }}>Sua nota:</label>
              <select value={nota} onChange={(e) => setNota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }}>
                <option value="5">5 Estrelas</option>
                <option value="4">4 Estrelas</option>
                <option value="3">3 Estrelas</option>
                <option value="2">2 Estrelas</option>
                <option value="1">1 Estrela</option>
              </select>
            </div>

            <textarea placeholder="Escreva sua opinião..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit', resize: 'none' }} />

            <div style={{ textAlign: 'left' }}>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', marginTop: '5px' }} />
            </div>

            {imagem && <img src={imagem} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', margin: '5px auto' }} />}
            
            <ActionButton onClick={handleSalvar}>Publicar Avaliação</ActionButton>
            <CloseButton onClick={() => setIsModalOpen(false)}>Cancelar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      <SectionTitle>Últimos produtos avaliados</SectionTitle>
      <ReviewsContainer>
        {produtosFiltrados.map((p) => (
          <ProductCard key={p.id} onClick={() => setSelectedProduct(p)}>
            <ProductImage src={p.imagem} />
            <ProductInfo>
              <h3>{p.nome}</h3>
              <p>{p.marca}</p>
              <Stars>{p.estrelas}</Stars>
            </ProductInfo>
          </ProductCard>
        ))}
      </ReviewsContainer>

      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
            <ModalHeader>
              <h2>{selectedProduct.nome}</h2>
              <p>{selectedProduct.marca}</p>
            </ModalHeader>
            <CarouselWrapper>
              <img src={selectedProduct.imagem} alt={selectedProduct.nome} />
            </CarouselWrapper>
            <div style={{ textAlign: 'center', margin: '15px 0' }}>
              <Stars>{selectedProduct.estrelas}</Stars>
              <h3 style={{ color: '#2563eb' }}>{selectedProduct.preco}</h3>
            </div>
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', marginBottom: '15px' }}>
              <p style={{ color: '#475569', fontStyle: 'italic' }}>"{selectedProduct.description}"</p>
            </div>
            <BuyButton href={selectedProduct.linkCompra} target="_blank" rel="noopener noreferrer">Ver na Loja Oficial</BuyButton>
          </ProductModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;