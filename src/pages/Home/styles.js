import styled, { keyframes } from 'styled-components';

const fadeInModal = keyframes`from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); }`;

export const Container = styled.div`
  min-height: 100vh; color: #f5f6fb; background: #080a12;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  .hero-copy { max-width: 1120px; margin: auto; text-align: left; }
  .hero-copy .eyebrow { color: #a78bfa; font-size: 12px; letter-spacing: .18em; font-weight: 800; }
  .hero-copy h1 { margin: 18px 0 12px; font-size: clamp(38px, 6vw, 64px); letter-spacing: -.055em; line-height: 1.04; }
  .hero-copy h1 span { color: #a78bfa; }
  .hero-copy p { margin: 0 0 34px; color: #a2a8b8; font-size: 17px; }
  .product-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .product-meta > span { color: #a78bfa; background: #8b5cf61a; padding: 5px 9px; border-radius: 20px; font-size: 11px; }
  .product-brand { color: #9aa1b2; font-size: 13px; margin: 5px 0 14px; }
  .product-price { color: #f7f7fb; font-size: 16px; }
  .empty-state { color: #a2a8b8; grid-column: 1/-1; text-align: center; padding: 50px 12px; }
  .brand-lockup { display:flex; align-items:center; gap:10px; }
  .brand-symbol { display:grid; place-items:center; width:38px; height:38px; filter:drop-shadow(0 4px 12px #8b5cf64a); }
  .brand-symbol svg { width:100%; height:100%; }
  .brand-name { color:#f5f3ff; font-size:18px; font-weight:800; letter-spacing:-.055em; }
  .brand-name span { color:#a78bfa; }
  @media(max-width: 600px) { .hero-copy { text-align: center; } }
`;

export const Header = styled.header`
  position: sticky; top: 0; z-index: 1000; min-height: 72px; padding: 12px max(5vw, calc((100vw - 1160px)/2));
  display: flex; justify-content: space-between; align-items: center; gap: 18px;
  background: #090b13eF; border-bottom: 1px solid #ffffff12; backdrop-filter: blur(18px);
  img { height: 38px !important; object-fit: contain; }
  > div:last-child { display:flex; align-items:center; gap: 8px; }
`;
export const Hero = styled.section`
  padding: 76px 22px 48px; color: #f8f8fc; background: radial-gradient(ellipse at 82% 0%, #54259b70, transparent 48%), linear-gradient(180deg,#111322,#0b0d17 80%);
  @media(max-width:600px){padding:50px 18px 34px;}
`;
export const SearchContainer = styled.div`
  max-width:1120px; margin:0 auto; display:flex; gap:10px; align-items:center;
  @media(max-width:680px){flex-wrap:wrap; input{flex-basis:100%;}}
`;
export const EvalButton = styled.button`
  white-space:nowrap; background:linear-gradient(110deg,#8b5cf6,#6d5dfc); color:white; padding:14px 18px; border:0; border-radius:12px; font-weight:700; cursor:pointer; box-shadow:0 8px 30px #6d5dfc30; transition:.2s;
  &:hover{transform:translateY(-2px);filter:brightness(1.1);}
`;
export const InputBusca = styled.input`
  flex:1; min-width:150px; padding:14px 18px; border:1px solid #ffffff1c; border-radius:12px; background:#171a29; color:#f5f6fb; font-size:15px; outline:none;
  &:focus{border-color:#9b7bff;box-shadow:0 0 0 3px #8b5cf626;} &::placeholder{color:#777f94;}
`;
export const FilterButton = styled.button`
  padding:14px 18px; color:#d7d8e0; background:#171a29; border:1px solid #ffffff1c; border-radius:12px; font-weight:650; cursor:pointer; &:hover{border-color:#9b7bff;}
`;
export const SectionTitle = styled.h2`
  max-width:1160px; margin:38px auto 4px; padding:0 22px; color:#f5f6fb; font-size:23px; letter-spacing:-.025em;
  small{margin-left:10px;color:#7f8799;font-size:13px;font-weight:500;}
`;
export const ReviewsContainer = styled.div`
  max-width:1160px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fill,minmax(245px,1fr)); gap:18px; padding:18px 22px 64px;
`;
export const ProductCard = styled.article`
  overflow:hidden; border:1px solid #ffffff12; border-radius:17px; background:#111421; cursor:pointer; transition:transform .25s,border-color .25s,box-shadow .25s;
  &:hover{transform:translateY(-5px);border-color:#8b5cf677;box-shadow:0 14px 42px #0007;}
`;
export const ProductImage = styled.img`
  width:100%; height:190px; object-fit:cover; display:block; box-sizing:border-box; background:#191d2c; border:1px solid #ffffff29;
`;
export const ProductGallery = styled.div`
  position:relative; width:100%; height:300px; overflow:hidden; border-radius:14px; background:#0b0e18;
`;
export const GalleryImage = styled.img`
  display:block; width:100%; height:100%; object-fit:contain; box-sizing:border-box; border:1px solid #a78bfa70; border-radius:14px; background:#0b0e18;
`;
export const GalleryArrow = styled.button`
  position:absolute; top:50%; left:${p=>p.$right?'auto':'12px'}; right:${p=>p.$right?'12px':'auto'}; transform:translateY(-50%);
  display:grid; place-items:center; width:40px; height:40px; border:1px solid #ffffff42; border-radius:50%;
  color:white; background:#090b13cf; font-size:28px; line-height:1; cursor:pointer; backdrop-filter:blur(8px); transition:.2s;
  &:hover{background:#8b5cf6;transform:translateY(-50%) scale(1.06);}
`;
export const GalleryPosition = styled.span`
  position:absolute; bottom:12px; left:50%; transform:translateX(-50%); padding:5px 10px; border:1px solid #ffffff24; border-radius:20px;
  color:#f4f2ff; background:#090b13c9; font-size:12px; font-weight:650; backdrop-filter:blur(8px);
`;
export const ProductInfo = styled.div`
  padding:15px 16px 18px; h3{font-size:17px;letter-spacing:-.02em;color:#f4f5fa;margin:10px 0 0;}
`;
export const Stars = styled.div`color:#f5b94c;font-size:13px;white-space:nowrap;`;
export const ModalOverlay = styled.div`
  position:fixed;inset:0;background:#03040bd9;backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:2000;padding:16px;
`;
export const ModalContent = styled.div`
  color:#f1f2f7;background:#141827;border:1px solid #ffffff1a;padding:26px;border-radius:20px;width:100%;max-width:550px;max-height:90vh;overflow-y:auto;animation:${fadeInModal} .25s ease-out;
  h2{margin:0 0 18px;} p{color:#bdc2d0;} strong{color:#f4f5fa;} hr{border-color:#ffffff1c!important;}
`;
export const ModalFieldGroup = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;@media(max-width:500px){grid-template-columns:1fr;}`;
const formStyles = `width:100%;padding:12px 13px;border-radius:10px;border:1px solid #ffffff20;background:#0d101b;color:#f4f5fa;outline:none;margin-bottom:10px;&:focus{border-color:#9b7bff;}`;
export const FormInput = styled.input`${formStyles}`;
export const FormSelect = styled.select`${formStyles}`;
export const FormTextArea = styled.textarea`${formStyles}height:110px;resize:vertical;`;
export const UploadPhotoContainer = styled.div`border:1px dashed #ffffff3a;padding:15px;border-radius:12px;text-align:center;background:#0d101b;cursor:pointer;margin-bottom:15px;label{cursor:pointer;color:#c5b4ff;font-weight:600;}input{display:none;}`;
export const PhotoPreviewGrid = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px;img{width:60px;height:60px;border-radius:8px;object-fit:cover;border:1px solid #ffffff24;}`;
export const PostButton = styled.button`background:linear-gradient(110deg,#8b5cf6,#6d5dfc);color:white;padding:13px;border:0;border-radius:10px;font-weight:700;cursor:pointer;width:100%;`;
export const CancelButton = styled.button`background:#1b2030;color:#c7cad5;padding:13px;border:1px solid #ffffff20;border-radius:10px;font-weight:650;cursor:pointer;width:100%;margin-top:10px;`;
export const LoginButton = styled.button`background:transparent;color:#d4c6ff;padding:9px 15px;border:1px solid #8b5cf688;border-radius:10px;font-weight:650;cursor:pointer;`;
export const RegisterButton = styled.button`background:#8b5cf6;color:white;padding:10px 15px;border:0;border-radius:10px;font-weight:700;cursor:pointer;`;
export const LogoutButton = styled.button`background:#3a1d2a;color:#ffb7c8;padding:9px 14px;border:1px solid #ff5a7a44;border-radius:10px;font-weight:650;cursor:pointer;`;
export const ProfileTabs = styled.div`display:flex;gap:20px;border-bottom:1px solid #ffffff20;margin-bottom:25px;`;
export const TabButton = styled.button`padding:12px 20px;border:0;background:none;cursor:pointer;font-weight:bold;color:${p=>p.active?'#a78bfa':'#939aab'};border-bottom:${p=>p.active?'2px solid #8b5cf6':'2px solid transparent'};`;
