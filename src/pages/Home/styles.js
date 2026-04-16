import styled from 'styled-components';

export const Container = styled.div`
  font-family: Arial, sans-serif;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 50px;
  background: white;
`;

export const Hero = styled.section`
  background-color: #1e40af; 
  color: white;
  text-align: center;
  padding: 80px 20px;
  display: flex;          
  flex-direction: column; 
  align-items: center;    
  gap: 20px;              
  
  h1 { 
    font-size: 48px; 
    margin-bottom: 10px; 

    @media (max-width: 768px) {
      font-size: 32px; 
    }
  }

  p { 
    font-size: 18px; 
    opacity: 0.9; 
    margin-bottom: 30px; 
    max-width: 800px;

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }
`;


export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1000px;
  margin: -40px auto 50px; 
  padding: 0 20px;
`;

export const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #eee;

  h3 { margin: 10px 0 5px; font-size: 16px; }
  span { color: #666; font-size: 12px; }`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 30px auto 0;
  
  /* Configuração para PC */
  flex-direction: row; 
  gap: 110px; 

  @media (max-width: 768px) {
    flex-direction: column;
    /* Resetamos o gap e usamos margin para não empurrar para os lados */
    gap: 15px; 
    padding: 0 20px;
    box-sizing: border-box;
  }
`;

export const Button = styled.button`
  width: 220px;
  height: 50px;
  background-color: #2563eb;
  color: white;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%; /* Ocupa a largura disponível no celular */
    max-width: 320px; /* Impede que fique absurdamente largo em tablets */
  }
`;

export const InputBusca = styled.input`
  width: 220px;
  height: 50px;
  padding: 0 15px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  outline: none;
  text-align: center;
  box-sizing: border-box; /* ESSENCIAL para não vazar a borda */

  @media (max-width: 768px) {
    width: 100%;
    max-width: 320px;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const LoginCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: center;

  h2 { margin-bottom: 10px; color: #333; }
  
  input {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
`;

export const SocialButton = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: bold;
  
  &:hover { background: #f5f5f5; }
`;

export const BrandSection = styled.section`
  padding: 40px 20px;
  background-color: #f8fafc; 
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  p {
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

export const BrandGrid = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center;     
  flex-wrap: wrap;         
  gap: 20px 45px;          
  margin: 30px auto 0;     
  max-width: 900px;        
  padding: 0 20px;
`;

export const BrandName = styled.span`
  font-size: 13px;         
  font-weight: 800;
  color: #64748b;          
  text-transform: uppercase;
  letter-spacing: 1.8px;   
  cursor: default;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  opacity: 0.8;            

  &:hover {
    color: #1e40af;        
    opacity: 1;            
    transform: translateY(-2px); 
  }
`;

export const SectionTitle = styled.h2`
  text-align: center;
  color: #1e293b;
  margin: 60px 0 30px;
  font-size: 24px;
`;

export const ReviewsContainer = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px 60px;
`;

export const ProductCard = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover { transform: scale(1.01); }

  @media (max-width: 650px) {
    flex-direction: column; 
    text-align: center;     
  }
`;

export const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;

  @media (max-width: 650px) {
    width: 100%;  
    height: 250px; 
  }
`;

export const ProductInfo = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;

  h3 {
    color: #1e293b;
    margin-bottom: 8px;
    font-size: 18px;
  }

  p {
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
`;

export const Stars = styled.div`
  color: #fbbf24; 
  font-size: 18px;
  display: flex;
  gap: 2px;
`;

export const ProductModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 800px;
  padding: 30px;
  border-radius: 20px;
  position: relative;
  
  
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 95%;   
    padding: 20px;
    margin: 10px;
  }
`;

export const ModalHeader = styled.div`
  margin-bottom: 20px;
  h2 { font-size: 24px; color: #1e293b; }
`;

export const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;

  img {
    max-height: 100%;
    object-fit: contain;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    border: 1px solid #e2e8f0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    &:hover { background: #f1f5f9; }
  }
  .left { left: 10px; }
  .right { right: 10px; }
`;

export const BuyButton = styled.a`
  display: inline-block;
  background: #2563eb;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin: 15px 0;
  transition: background 0.2s;
  &:hover { background: #1e40af; }
`;

export const CommentsSection = styled.div`
  margin-top: 40px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;

  h4 { margin-bottom: 15px; color: #1e293b; }
`;

export const CommentCard = styled.div`
  background: #f8fafc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  
  strong { display: block; font-size: 14px; margin-bottom: 5px; }
  p { font-size: 14px; color: #475569; }
`;
// MODAL DE ADICIONAR PRODUTO(AVALIAR) 
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  h2 {
    color: #1e40af;
    margin-bottom: 10px;
    text-align: center;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #2563eb;
  }
`;

export const ActionButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
  margin-top: 5px;

  &:hover {
    color: #ef4444;
  }
`;