import { useState } from 'react';
import { 
  Container, Header, Hero, Button, SearchContainer, InputBusca, Overlay, 
  LoginCard, SocialButton, BrandSection, BrandGrid, BrandName, SectionTitle, 
  ReviewsContainer, ProductCard, ProductImage, ProductInfo, Stars, 
  ModalOverlay, ProductModalContent, ModalHeader, CarouselWrapper, 
  BuyButton, CommentsSection, CommentCard 
} from './styles';

function Home() {
  const [estaAberto, setEstaAberto] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <Container>
      {/* 1. CABEÇALHO */}
      <Header>
        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>👁️ Olha o Produto</div>
        <button 
          onClick={() => setEstaAberto(true)} 
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
        >
          Entrar
        </button>
      </Header>

      {/* 2. HERO / BUSCA */}
      <Hero>
        <h1>Avaliações Reais de Eletrônicos</h1>
        <p>Uma plataforma colaborativa de avaliação de produtos eletrônicos construída por usuários reais.</p>
        <SearchContainer>
          <Button>+ Avaliar Produto</Button>
          <InputBusca placeholder="Buscar produtos..." />
        </SearchContainer>
      </Hero>

      {/* 3. MARCAS */}
      <BrandSection>
        <p>Principais marcas avaliadas</p>
        <BrandGrid>
          <BrandName>Samsung</BrandName>
          <BrandName>Apple</BrandName>
          <BrandName>Amazon</BrandName>
          <BrandName>Google</BrandName>
          <BrandName>Dell</BrandName>
          <BrandName>LG</BrandName>
          <BrandName>Sony</BrandName>
          <BrandName>Xiaomi</BrandName>
        </BrandGrid>
      </BrandSection>

      {/* 4. ÚLTIMOS PRODUTOS AVALIADOS */}
      <SectionTitle>Últimos produtos avaliados</SectionTitle>
      <ReviewsContainer>
        {/* Produto 1 */}
        <ProductCard onClick={() => setSelectedProduct({
          title: 'iPhone 15 Pro Max - Apple',
          description: 'A câmera é espetacular e o acabamento em titânio deixou o celular muito mais leve. A bateria dura o dia todo.',
          image: 'https://m.media-amazon.com/images/I/71657UrTiIL._AC_SL1500_.jpg',
          stars: '★★★★★'
        })}>
          <ProductImage src="https://m.media-amazon.com/images/I/71657UrTiIL._AC_SL1500_.jpg" />
          <ProductInfo>
            <h3>iPhone 15 Pro Max - Apple</h3>
            <p>"A câmera é espetacular..."</p>
            <Stars>★★★★★</Stars>
          </ProductInfo>
        </ProductCard>

        {/* Produto 2 */}
        <ProductCard onClick={() => setSelectedProduct({
          title: 'Mouse Logitech MX Master 3S',
          description: 'O melhor mouse para produtividade que já usei. Os cliques são silenciosos e o scroll é infinito.',
          image: 'https://m.media-amazon.com/images/I/61m7SInS8SL._AC_SL1000_.jpg',
          stars: '★★★★☆'
        })}>
          <ProductImage src="https://m.media-amazon.com/images/I/61m7SInS8SL._AC_SL1000_.jpg" />
          <ProductInfo>
            <h3>Mouse Logitech MX Master 3S</h3>
            <p>"O melhor mouse para produtividade..."</p>
            <Stars>★★★★☆</Stars>
          </ProductInfo>
        </ProductCard>
      </ReviewsContainer>

      {/* 5. CAIXA DE LOGIN */}
      {estaAberto && (
        <Overlay onClick={() => setEstaAberto(false)}>
          <LoginCard onClick={(e) => e.stopPropagation()}>
            <h2>Entrar</h2>
            <input type="email" placeholder="E-mail" />
            <input type="password" placeholder="Senha" />
            <button style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Entrar</button>
            <hr />
            <SocialButton>Google</SocialButton>
            <button onClick={() => setEstaAberto(false)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginTop: '10px' }}>Fechar</button>
          </LoginCard>
        </Overlay>
      )}

      {/* 6. CAIXA DETALHES DO PRODUTO */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ProductModalContent onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
            
            <ModalHeader>
              <h2>{selectedProduct.title}</h2>
            </ModalHeader>

            <CarouselWrapper>
              <div className="arrow left">❮</div>
              <img src={selectedProduct.image} alt="Produto" />
              <div className="arrow right">❯</div>
            </CarouselWrapper>

            <Stars>{selectedProduct.stars}</Stars>
            <BuyButton href="#" target="_blank">Ver na Loja Oficial</BuyButton>

            <div style={{ marginTop: '15px' }}>
              <p>{selectedProduct.description}</p>
            </div>

            <CommentsSection>
              <h4>Opiniões de quem comprou</h4>
              <CommentCard>
                <strong>João Silva</strong>
                <p>Comprei faz uma semana e a entrega foi super rápida!</p>
              </CommentCard>
            </CommentsSection>
          </ProductModalContent>
        </ModalOverlay>
      )}

    </Container>
  );
}

export default Home;