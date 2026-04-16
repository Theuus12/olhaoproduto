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

  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nota, setNota] = useState('5');
  const [linkCompra, setLinkCompra] = useState('');
  const [imagensBase64, setImagensBase64] = useState([]); // Agora é um array para várias fotos

  // FUNÇÃO DE MÁSCARA MONETÁRIA (RECUPERADA)
  const formatarMoeda = (valor) => {
    let v = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return "R$ " + v;
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

  useEffect(() => {
    buscarProdutos();
  }, []);

  // FUNÇÃO PARA ADICIONAR MÚLTIPLAS FOTOS
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

  const handleSalvar = async () => {
    if (!nome || !marca || !descricao || imagensBase64.length === 0) {
      return alert("Preencha os campos obrigatórios e adicione ao menos uma imagem!");
    }
    
    try {
      await addDoc(collection(db, 'produtos'), {
        nome, 
        marca, 
        preco, 
        description: descricao,
        stars: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)), 
        linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`,
        imagens: imagensBase64, // Array de fotos
        imagemPrincipal: imagensBase64[0], // Para a vitrine
        criadoEm: new Date()
      });
      
      setIsModalOpen(false);
      setNome(''); setMarca(''); setPreco(''); setDescricao(''); setNota('5'); setLinkCompra(''); setImagensBase64([]);
      buscarProdutos(); 
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
            <FormInput 
               placeholder="Preço (ex: R$ 0,00)" 
               value={preco} 
               onChange={(e) => setPreco(formatarMoeda(e.target.value))} 
            />
            <FormInput placeholder="Link de Compra" value={linkCompra} onChange={(e) => setLinkCompra(e.target.value)} />

            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Sua nota:</label>
              <select value={nota} onChange={(e) => setNota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }}>
                <option value="5">5 Estrelas (Excelente)</option>
                <option value="4">4 Estrelas (Muito Bom)</option>
                <option value="3">3 Estrelas (Bom)</option>
                <option value="2">2 Estrelas (Regular)</option>
                <option value="1">1 Estrela (Ruim)</option>
              </select>
            </div>

            <textarea placeholder="Sua opinião..." value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />

            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <label htmlFor="file-upload" className="custom-file-upload" style={{
                display: 'inline-block',
                padding: '10px 15px',
                cursor: 'pointer',
                background: '#f1f5f9',
                color: '#64748b',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid #e2e8f0'
              }}>
                📷 Adicionar Fotos (Múltiplas)
              </label>
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

      <SectionTitle>Feed de Avaliações</SectionTitle>
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
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '10px' }}>
              {(selectedProduct.imagens || [selectedProduct.imagemPrincipal]).map((img, idx) => (
                <img key={idx} src={img} style={{ height: '200px', borderRadius: '10px' }} alt="Produto" />
              ))}
            </div>
            <h2>{selectedProduct.nome}</h2>
            <p style={{ margin: '10px 0', color: '#64748b' }}>{selectedProduct.marca}</p>
            <h3 style={{ color: '#2563eb', marginBottom: '15px' }}>{selectedProduct.preco}</h3>
            <p style={{ margin: '20px 0', padding: '15px', background: '#f8fafc', borderRadius: '8px', fontStyle: 'italic', color: '#475569' }}>"{selectedProduct.description}"</p>
            <BuyButton href={selectedProduct.linkCompra} target="_blank" rel="noopener noreferrer">Ver Produto na Loja</BuyButton>
            <CloseButton onClick={() => setSelectedProduct(null)} style={{ marginTop: '10px' }}>Fechar</CloseButton>
          </ProductModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;