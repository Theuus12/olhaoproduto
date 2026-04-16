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
  const [imagemBase64, setImagemBase64] = useState(''); // Estado para a imagem

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

  // FUNÇÃO PARA LER A IMAGEM DO COMPUTADOR (RESTAURADA)
  const handleFileChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemBase64(reader.result); // Converte a imagem para uma string base64
      };
      reader.readAsDataURL(arquivo);
    }
  };

  const handleSalvar = async () => {
    // Adicionei a imagem como campo obrigatório
    if (!nome || !marca || !descricao || !imagemBase64) {
      return alert("Preencha os campos obrigatórios e adicione uma imagem!");
    }
    
    try {
      // SALVAR NO FIREBASE COM A IMAGEM
      await addDoc(collection(db, 'produtos'), {
        nome, 
        marca, 
        preco, 
        description: descricao,
        stars: '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota)), // Corrigido para "stars" conforme seu styles.js original
        linkCompra: linkCompra.startsWith('http') ? linkCompra : `https://${linkCompra}`,
        imagem: imagemBase64, // Agora salva a imagem real que o usuário escolheu
        criadoEm: new Date()
      });
      
      setIsModalOpen(false);
      // Limpar os campos após salvar
      setNome(''); setMarca(''); setPreco(''); setDescricao(''); setNota('5'); setLinkCompra(''); setImagemBase64('');
      buscarProdutos(); // Recarrega a lista para mostrar o novo produto
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

            {/* SELETOR DE NOTA (RESTAURADO) */}
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

            {/* BOTÃO DE ADICIONAR IMAGEM (RESTAURADO) */}
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
                📷 Adicionar Imagem do Produto
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              {imagemBase64 && <img src={imagemBase64} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', marginLeft: '10px', verticalAlign: 'middle' }} />}
            </div>

            {/* TEXTO DO BOTÃO ALTERADO (ALTERAÇÃO SOLICITADA) */}
            <ActionButton onClick={handleSalvar}>Adicionar Avaliação</ActionButton>
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
              {/* Note que aqui você deve usar p.stars, pois é como está sendo salvo agora */}
              <Stars>{p.stars}</Stars> 
            </ProductInfo>
          </ProductCard>
        ))}
      </ReviewsContainer>

      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <img src={selectedProduct.imagem} alt={selectedProduct.nome} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '10px', marginBottom: '15px' }} />
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