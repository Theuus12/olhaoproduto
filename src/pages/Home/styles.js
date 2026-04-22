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
  h1 { font-size: 32px; margin-bottom: 30px; }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  max-width: 1000px;
  margin: 0 auto;
  align-items: center;
  flex-wrap: wrap;
`;

export const EvalButton = styled.button`
  flex: 1;
  max-width: 350px;
  min-width: 200px;
  background: #1e40af;
  color: white;
  padding: 16px 25px;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: 0.3s;
  &:hover { background: #1e3a8a; transform: translateY(-2px); }
`;

export const InputBusca = styled.input`
  flex: 1;
  max-width: 350px;
  min-width: 200px;
  padding: 16px 25px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  outline: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

export const FilterButton = styled.button`
  background: white;
  color: #2563eb;
  padding: 10px 18px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover { background: #f8fafc; }
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

export const Stars = styled.div` color: #fbbf24; font-size: 18px; `;

export const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 2000;
`;

export const ModalContent = styled.div`
  background: white; padding: 30px; border-radius: 20px;
  width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto;
  animation: ${fadeInModal} 0.3s ease-out forwards;
`;

export const ModalFieldGroup = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;
`;

export const FormInput = styled.input`
  padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: #f8fafc; outline: none; width: 100%; margin-bottom: 10px;
`;

export const FormSelect = styled.select`
  padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: #f8fafc; width: 100%; margin-bottom: 10px;
`;

export const FormTextArea = styled.textarea`
  padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: #f8fafc; width: 100%; height: 100px; resize: none; margin-bottom: 10px;
`;

export const UploadPhotoContainer = styled.div`
  border: 2px dashed #e2e8f0; padding: 15px; border-radius: 12px;
  text-align: center; background: #f8fafc; cursor: pointer; margin-bottom: 15px;
  label { cursor: pointer; color: #64748b; font-weight: 500; }
  input { display: none; }
`;

export const PhotoPreviewGrid = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;
  img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }
`;

export const PostButton = styled.button`
  background: #2563eb; color: white; padding: 14px;
  border: none; border-radius: 10px; font-weight: bold; cursor: pointer;
  width: 100%; &:hover { background: #1d4ed8; }
`;

export const CancelButton = styled.button`
  background: white; color: #64748b; padding: 14px;
  border: 1px solid #e2e8f0; border-radius: 10px; font-weight: bold; cursor: pointer;
  width: 100%; margin-top: 10px;
`;

export const LoginButton = styled.button`
  background: transparent; color: #2563eb; padding: 10px 18px;
  border: 1px solid #2563eb; border-radius: 20px; font-weight: bold; cursor: pointer;
`;

export const RegisterButton = styled.button`
  background: #2563eb; color: white; padding: 10px 18px;
  border: none; border-radius: 20px; font-weight: bold; cursor: pointer; margin-left: 10px;
`;

export const LogoutButton = styled.button`
  background: #ef4444; color: white; padding: 10px 20px;
  border: none; border-radius: 20px; font-weight: bold; cursor: pointer; margin-left: 10px;
`;

export const ProfileTabs = styled.div` display: flex; gap: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 25px; `;
export const TabButton = styled.button`
  padding: 12px 20px; border: none; background: none; cursor: pointer;
  font-weight: bold; color: ${props => props.active ? '#2563eb' : '#64748b'};
  border-bottom: ${props => props.active ? '3px solid #2563eb' : 'none'};
`;