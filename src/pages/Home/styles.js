import styled, { keyframes } from 'styled-components';

const fadeInModal = keyframes`
  from { opacity: 0; transform: translateY(-30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f1f5f9;
`;

export const Header = styled.header`
  background: white;
  padding: 15px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

export const Hero = styled.div`
  background: #2563eb;
  padding: 60px 20px;
  text-align: center;
  color: white;
  h1 { font-size: 32px; margin-bottom: 20px; }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
`;

export const InputBusca = styled.input`
  flex: 1;
  padding: 12px 20px;
  border-radius: 25px;
  border: none;
  font-size: 16px;
  outline: none;
`;

export const SectionTitle = styled.h2`
  max-width: 1200px;
  margin: 40px auto 20px;
  padding: 0 20px;
  color: #1e293b;
`;

export const ReviewsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px;
`;

export const ProductCard = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: 0.3s;
  &:hover { transform: translateY(-5px); }
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const ProductInfo = styled.div`
  padding: 20px;
  h3 { font-size: 18px; color: #1e293b; margin-bottom: 8px; }
`;

export const Stars = styled.div`
  color: #fbbf24;
  font-size: 18px;
`;

// --- MODAIS ---

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeInModal} 0.3s ease-out forwards;
  
  h2 { color: #1e293b; margin-bottom: 20px; text-align: center; }
`;

export const ProductModalContent = styled(ModalContent)`
  max-width: 700px;
`;

export const ModalFieldGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 10px;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  label { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 5px; }
`;

export const FormInput = styled.input`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  outline: none;
  &:focus { border-color: #2563eb; background: white; }
`;

export const FormSelect = styled.select`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  outline: none;
  cursor: pointer;
`;

export const FormTextArea = styled.textarea`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  height: 80px;
  resize: none;
  outline: none;
`;

export const UploadPhotoContainer = styled.div`
  border: 2px dashed #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  background: #f8fafc;
  label { cursor: pointer; display: block; }
  input { display: none; }
`;

export const PhotoPreviewGrid = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;
  img { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; }
`;

export const ModalFooter = styled.div`
  display: flex; gap: 10px; margin-top: 20px;
`;

export const PostButton = styled.button`
  flex: 1; background: #2563eb; color: white; padding: 14px;
  border: none; border-radius: 10px; font-weight: bold; cursor: pointer;
  &:hover { background: #1d4ed8; }
`;

export const CancelButton = styled.button`
  flex: 1; background: white; color: #64748b; padding: 14px;
  border: 1px solid #e2e8f0; border-radius: 10px; font-weight: bold; cursor: pointer;
  &:hover { background: #f1f5f9; }
`;

export const BuyButton = styled.a`
  display: inline-block;
  background: #2563eb;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
`;

export const Button = styled(PostButton)``; // Alias para compatibilidade
export const ActionButton = styled(PostButton)``; // Alias para compatibilidade
export const CloseButton = styled(CancelButton)``; // Alias para compatibilidade