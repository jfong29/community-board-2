import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import userLocatorImg from '@/assets/user-locator.png';
import {
  MapContainer, TileLayer, Marker, Polyline, Polygon,
  useMap, useMapEvents, ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin, xyToLatLng } from '@/data/pins';
import { Landmark } from '@/data/landmarks';
import { useNavigate } from 'react-router-dom';
import zoomInIcon from '@/assets/zoom-in.svg';
import zoomOutIcon from '@/assets/zoom-out.svg';
import recenterIcon from '@/assets/recenter.svg';
import { motion, AnimatePresence } from 'framer-motion';
import RequestCityModal from './RequestCityModal';
import savedIcon from '@/assets/saved.svg';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Constants ── */
const CENTER: [number, number] = [40.7359, -73.9911];
const YOU_LOCATION: [number, number] = [40.7359, -73.9911];

const MAX_BOUNDS = L.latLngBounds(
  [40.5700, -74.0800],
  [40.9000, -73.7500],
);
const MIN_ZOOM = 13;
const MAX_ZOOM = 16;

/* ── Category visuals ── */
const categoryColor: Record<string, string> = {
  offer: '#79E824', request: '#FF48B5', observation: '#FF6C2F', event: '#B036FF',
};
const categoryGlow: Record<string, string> = {
  offer: 'rgba(121,232,36,0.6)', request: 'rgba(255,72,181,0.6)',
  observation: 'rgba(255,108,47,0.5)', event: 'rgba(176,54,255,0.5)',
};

/* Gradient stops matching DetailSheet popup style */
const categoryGradient: Record<string, { top: string; bottom: string; outline: string }> = {
  offer:       { top: '#C6FF9A', bottom: '#A8F261', outline: 'rgba(168, 242, 97, 0.9)' },
  request:     { top: '#FF84CE', bottom: '#FF61BF', outline: 'rgba(231, 134, 192, 0.9)' },
  observation: { top: '#FFB088', bottom: '#FF8B52', outline: 'rgba(255, 139, 82, 0.9)' },
  event:       { top: '#D69BFF', bottom: '#B86FFF', outline: 'rgba(184, 111, 255, 0.9)' },
};

/* ── Pin SVG builder ── */
function pinSvg(category: string, size: number, dim = false): string {
  const color = categoryColor[category] || '#888';
  const opacity = dim ? 0.6 : 1;

  switch (category) {
    case 'offer':
      return `<svg width="${size}" height="${Math.round(size * 33/37)}" viewBox="0 0 37 33" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M9.97159 16.5C14.9255 8.99862 17 1.5 18.9155 1.5C21.5 1.5 26.9541 12.9128 29.1215 16.5C32.24 21.6613 35.9179 30.458 35.4614 31.1794C35.0048 31.9008 9.13342 31.1794 1.57536 31.1794C0.95609 31.1794 4.18876 25.2565 9.97159 16.5Z" fill="${color}" stroke="black" stroke-width="3"/>
      </svg>`;
    case 'request':
      return `<svg width="${size}" height="${Math.round(size * 26/32)}" viewBox="0 0 32 26" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M24.4635 14.1795C20.6214 20.948 16.8528 25.6868 15.6864 25.6907C14.5201 25.6945 10.0357 18.072 7.98491 15.0338C5.03411 10.6622 -0.404111 1.16213 0.0237687 0.548366C0.451647 -0.065392 24.9395 -0.251254 31.9312 0.44337C32.5107 0.500949 28.9659 6.24756 24.4635 14.1795Z" fill="${color}" stroke="black" stroke-width="3"/>
      </svg>`;
    case 'observation':
      return `<svg width="${size}" height="${size}" viewBox="0 0 33 33" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M16.1543 1.5C19.6253 1.49998 23.0776 1.62452 25.7686 1.86914C27.1181 1.99183 28.2425 2.14144 29.0693 2.3125C29.4843 2.39835 29.7898 2.48326 29.9971 2.55859C30.0249 2.56871 30.0484 2.58045 30.0693 2.58887C30.0791 2.61257 30.0933 2.63922 30.1055 2.67188C30.1847 2.88529 30.2741 3.19868 30.3662 3.62109C30.5496 4.46255 30.7165 5.60586 30.8584 6.97461C31.1414 9.70445 31.3119 13.203 31.3428 16.7012C31.3736 20.2018 31.2642 23.6587 30.998 26.3115C30.8643 27.6442 30.696 28.7262 30.501 29.4932C30.411 29.847 30.3239 30.0915 30.2539 30.2471C30.2065 30.2608 30.1469 30.2809 30.0713 30.2988C29.8068 30.3614 29.4477 30.424 28.9922 30.4844C28.083 30.6048 26.8834 30.7021 25.4756 30.7754C22.6652 30.9217 19.1195 30.9686 15.6055 30.9375C12.0926 30.9064 8.6357 30.7978 6.00488 30.6357C4.68582 30.5545 3.59694 30.4615 2.82031 30.3613C2.63999 30.3381 2.48354 30.3139 2.34961 30.292C2.32464 30.1513 2.29768 29.986 2.27051 29.7949C2.15814 29.0047 2.0478 27.8974 1.94727 26.5596C1.7467 23.8906 1.5914 20.3885 1.5293 16.8486C1.46713 13.3054 1.49942 9.75469 1.66797 6.98145C1.75252 5.59032 1.86937 4.43079 2.01758 3.5791C2.09196 3.15174 2.16757 2.83889 2.2373 2.62891C2.24294 2.61194 2.2498 2.59634 2.25488 2.58203C2.27202 2.57531 2.29038 2.56629 2.31152 2.55859C2.51869 2.48327 2.82517 2.39837 3.24023 2.3125C4.06689 2.1415 5.19078 1.99182 6.54004 1.86914C9.23086 1.6245 12.6832 1.50003 16.1543 1.5Z" fill="${color}" stroke="black" stroke-width="3"/>
      </svg>`;
    case 'event':
      return `<svg width="${size}" height="${Math.round(size * 46/63)}" viewBox="0 0 63 46" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M40.8232 3.10449C43.9626 1.01781 48.0803 1.14993 50.8389 2.45508C53.6244 3.7732 57.4973 7.38467 56.9814 13.9414C56.7195 17.2693 55.1926 19.6053 53.7451 21.0908C53.4642 21.3792 53.1847 21.6351 52.918 21.8623C53.1323 22.0027 53.3569 22.1492 53.585 22.3027C54.2754 22.7676 55.0205 23.2911 55.6797 23.8027C56.3132 24.2945 56.96 24.8459 57.3828 25.3652C57.6691 25.7169 57.9004 26.1759 58.085 26.5957C58.282 27.0438 58.4772 27.5691 58.666 28.1289C59.0443 29.2504 59.4226 30.59 59.7588 31.8955C60.0959 33.2045 60.3961 34.5005 60.6172 35.543C60.8264 36.5296 60.9941 37.4186 61.0195 37.8281C61.0458 38.2504 60.8918 38.6646 60.5967 38.9678C60.3016 39.2707 59.8924 39.4347 59.4697 39.4199L30.0078 38.3896C29.546 38.3735 29.117 38.1456 28.8457 37.7715C28.5142 37.3143 28.5002 36.8145 28.501 36.6152C28.502 36.3536 28.5425 36.0921 28.5889 35.8652C28.6831 35.4044 28.8513 34.8621 29.0508 34.3008C29.4544 33.1652 30.0539 31.7616 30.6895 30.3887C31.3273 29.0107 32.0162 27.6313 32.6064 26.5361C32.9009 25.9899 33.1781 25.5008 33.417 25.1133C33.6159 24.7908 33.892 24.3625 34.1797 24.0967L34.3242 23.9707C34.6923 23.6679 35.2579 23.306 35.7969 22.9746C36.4648 22.5639 37.2604 22.1008 38.0176 21.6699C38.3982 21.4533 38.7716 21.2427 39.1172 21.0498C38.8712 20.7851 38.6106 20.4896 38.3516 20.1631C37.1902 18.6993 35.8994 16.4883 35.8994 13.8232C35.8994 9.10805 37.6573 5.20888 40.8232 3.10449Z" fill="${color}" stroke="black" stroke-width="3" stroke-linejoin="round"/>
        <path d="M13.8223 3.10449C16.9616 1.01781 21.0793 1.14993 23.8379 2.45508C26.6235 3.7732 30.4963 7.38467 29.9805 13.9414C29.7185 17.2693 28.1916 19.6053 26.7441 21.0908C26.4632 21.3792 26.1837 21.6351 25.917 21.8623C26.1313 22.0027 26.356 22.1492 26.584 22.3027C27.2744 22.7676 28.0196 23.2911 28.6787 23.8027C29.3122 24.2945 29.959 24.8459 30.3818 25.3652C30.6682 25.7169 30.8994 26.1759 31.084 26.5957C31.281 27.0438 31.4762 27.5691 31.665 28.1289C32.0433 29.2504 32.4216 30.59 32.7578 31.8955C33.0949 33.2045 33.3952 34.5005 33.6162 35.543C33.8254 36.5296 33.9931 37.4186 34.0186 37.8281C34.0448 38.2504 33.8908 38.6646 33.5957 38.9678C33.3007 39.2707 32.8914 39.4347 32.4688 39.4199L3.00684 38.3896C2.54499 38.3735 2.11606 38.1456 1.84473 37.7715C1.51325 37.3143 1.49921 36.8145 1.5 36.6152C1.50106 36.3536 1.54152 36.0921 1.58789 35.8652C1.68213 35.4044 1.8503 34.8621 2.0498 34.3008C2.45342 33.1652 3.05291 31.7616 3.68848 30.3887C4.32636 29.0107 5.01522 27.6313 5.60547 26.5361C5.89989 25.9899 6.1771 25.5008 6.41602 25.1133C6.61489 24.7908 6.891 24.3625 7.17871 24.0967L7.32324 23.9707C7.69137 23.6679 8.25695 23.306 8.7959 22.9746C9.46387 22.5639 10.2595 22.1008 11.0166 21.6699C11.3972 21.4533 11.7707 21.2427 12.1162 21.0498C11.8702 20.7851 11.6097 20.4896 11.3506 20.1631C10.1892 18.6993 8.89844 16.4883 8.89844 13.8232C8.89847 9.10805 10.6563 5.20888 13.8223 3.10449Z" fill="${color}" stroke="black" stroke-width="3" stroke-linejoin="round"/>
        <path d="M27.3057 7.43945C30.3575 5.33388 34.3665 5.46673 37.0508 6.78516C39.7652 8.11849 43.4737 11.7354 42.9795 18.2568C42.7284 21.569 41.264 23.9006 39.8652 25.3906C39.5593 25.7166 39.2551 26.0015 38.9678 26.25C39.3816 26.5544 39.8429 26.8969 40.3174 27.2568C41.1191 27.8651 41.9707 28.5303 42.7031 29.1455C43.4025 29.733 44.0976 30.3595 44.502 30.875C44.7923 31.2452 44.9984 31.7037 45.1514 32.1113C45.3135 32.5432 45.4577 33.0358 45.5869 33.5488C45.8456 34.5759 46.0677 35.7811 46.249 36.9434C46.6111 39.2634 46.8337 41.5442 46.8701 42.1523C46.8953 42.5743 46.7407 42.9876 46.4453 43.29C46.1499 43.5923 45.7407 43.7555 45.3184 43.7402L16.9336 42.71C16.4633 42.6928 16.0284 42.4561 15.7588 42.0703C15.5045 41.7063 15.4431 41.319 15.4209 41.124C15.3943 40.8899 15.3969 40.6525 15.4102 40.4404C15.437 40.0128 15.5166 39.5142 15.6201 39.001C15.8291 37.9643 16.1725 36.6947 16.5547 35.4541C16.938 34.2102 17.3714 32.9595 17.7695 31.9551C17.9679 31.4548 18.1658 30.9957 18.3506 30.6221C18.4992 30.3215 18.7393 29.8597 19.0625 29.5498C19.2696 29.3512 19.5718 29.1337 19.8447 28.9463C20.1463 28.7393 20.5165 28.4991 20.9219 28.2432C21.7341 27.7304 22.7272 27.1296 23.6846 26.5605C24.3952 26.1381 25.091 25.7308 25.6846 25.3848C25.4383 25.1113 25.1774 24.8035 24.917 24.4629C23.7954 22.9955 22.5596 20.7911 22.5596 18.1436C22.5596 13.4505 24.2421 9.55324 27.3057 7.43945Z" fill="${color}" stroke="black" stroke-width="3" stroke-linejoin="round"/>
      </svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" fill-opacity="0.7"/></svg>`;
  }
}

function urgentRequestSvg(size: number): string {
  return `<svg width="${size}" height="${Math.round(size * 72/38)}" viewBox="0 0 38 72" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5255 70.2381C18.1489 70.2042 17.8523 70.058 17.6789 69.9576C17.4591 69.8304 17.2639 69.6741 17.1023 69.5289C16.7775 69.2371 16.4407 68.8574 16.1134 68.453C15.4514 67.6353 14.6865 66.5402 13.9197 65.3899C13.1481 64.2325 12.3507 62.9818 11.6248 61.8418C10.8927 60.6921 10.2408 59.6668 9.74215 58.928C8.2362 56.697 6.11648 53.1903 4.42814 50.1681C3.58424 48.6575 2.83386 47.2427 2.31726 46.1536C2.06177 45.6149 1.8454 45.1184 1.7051 44.7142C1.63704 44.5181 1.56741 44.2889 1.5301 44.0605C1.51159 43.9471 1.492 43.7834 1.50318 43.5967C1.5131 43.4315 1.55514 43.0868 1.79335 42.7451C2.01079 42.4332 2.28592 42.2868 2.37665 42.2403C2.50092 42.1765 2.61462 42.1372 2.68874 42.1142C2.83979 42.0674 2.99579 42.036 3.12396 42.0142C3.38997 41.9688 3.7269 41.932 4.1021 41.8996C4.86255 41.834 5.91007 41.7781 7.15039 41.7314C9.63758 41.6377 12.9746 41.5782 16.5083 41.56C23.5464 41.5237 31.4941 41.6494 35.0802 42.0057C35.4566 42.0432 35.86 42.223 36.1495 42.5881C36.4026 42.9075 36.4667 43.241 36.4852 43.4239C36.5197 43.7656 36.441 44.0616 36.4057 44.1869C36.3181 44.4975 36.1602 44.8559 35.995 45.201C35.6493 45.9229 35.0966 46.9349 34.409 48.1515C33.0638 50.5313 30.9711 54.0944 28.7684 57.9748C26.8213 61.4051 24.8801 64.3436 23.2591 66.4432C22.4522 67.4884 21.6993 68.3586 21.0448 68.9827C20.7198 69.2926 20.3852 69.5739 20.0533 69.7877C19.768 69.9716 19.2798 70.2434 18.6915 70.2453L18.5255 70.2381Z" fill="#FF48B5" stroke="black" stroke-width="3"/>
    <path d="M16.9071 36C16.7617 35.9286 16.4708 35.7857 16.0344 35.5714C15.598 35.3571 15.3071 35.1786 15.1617 35.0357C15.1253 34.5 15.089 33.8214 15.0526 33C15.0526 32.1786 15.0344 31.3214 14.998 30.4286C14.998 29.5357 14.998 28.6964 14.998 27.9107C15.1799 27.7321 15.3799 27.5714 15.598 27.4286C15.8162 27.2857 16.0162 27.1429 16.198 27C17.5071 27 18.8162 27.0179 20.1253 27.0536C21.4708 27.0893 22.5799 27.1429 23.4526 27.2143C23.5617 27.6071 23.6708 28.5714 23.7799 30.1071C23.9253 31.6071 23.998 33.25 23.998 35.0357C23.6708 35.1786 23.1617 35.3036 22.4708 35.4107C21.8162 35.5179 21.1071 35.6071 20.3435 35.6786C19.5799 35.7857 18.8708 35.8571 18.2162 35.8929C17.598 35.9643 17.1617 36 16.9071 36Z" fill="#FF48B5" stroke="black" stroke-width="3"/>
    <path d="M24.7139 1.5L25.0479 1.68164C25.2717 1.80308 25.5725 1.98571 25.9316 2.21289C26.3352 2.44716 26.7153 2.69514 27.0039 2.95605L27.6016 3.49609L27.4814 4.29199C27.1555 6.45319 26.7575 8.72555 26.2881 11.1084C25.8178 13.4958 25.293 15.8516 24.7139 18.1748C24.1334 20.5034 23.5145 22.6753 22.8574 24.6885L22.6309 25.3848L21.9424 25.6338C21.5499 25.7757 21.0738 25.9302 20.5215 26.0967L20.4932 26.1045L20.4639 26.1123C19.9332 26.2494 19.402 26.3696 18.8701 26.4727L18.1875 26.6045L17.6455 26.1689L16.6787 25.3926L16.2822 25.0742L16.1611 24.5811L11.541 5.78613L11.3271 4.91602L11.9922 4.31543L13.2812 3.15039L13.5586 2.89941L13.9219 2.80762C14.6388 2.62759 15.5027 2.47356 16.5 2.33984C17.4756 2.17716 18.4847 2.03041 19.5273 1.90039C20.5829 1.76877 21.5372 1.6685 22.3887 1.60156H22.3936C23.2532 1.5368 23.9126 1.5 24.333 1.5H24.7139Z" fill="#FF48B5" stroke="black" stroke-width="3"/>
  </svg>`;
}

/* Per-category shape SVGs (recolored gradients matching new pin design) */
const categoryShapeSvg: Record<string, (w: number, h: number) => string> = {
  request: (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 81 68" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#rq_ii)"><path d="M35.4822 64.8454L37.1775 66.8557C39.6434 66.7526 39.3805 66.5464 42.2574 66.2371L76.5089 6.71294L77.6378 0.505332L56.6447 0.5L39.1504 0.731128H25.155L2.99576 0.5L0.663086 2.01214L35.4822 64.8454Z" fill="url(#rq_g)"/></g>
    <path d="M2.99805 0.25L25.1572 0.481445H39.1475L56.6416 0.25H56.6445L77.6377 0.254883L77.9375 0.255859L77.8838 0.549805L76.7549 6.75781L76.7471 6.7998L76.7256 6.83789L42.4736 66.3613L42.4102 66.4717L42.2842 66.4854C40.8546 66.639 40.2083 66.7669 39.6055 66.8701C38.9926 66.975 38.4308 67.0535 37.1875 67.1055L37.0654 67.1104L36.9863 67.0166L35.291 65.0068L35.2754 64.9883L35.2637 64.9668L0.444336 2.13379L0.331055 1.92969L0.527344 1.80273L2.85938 0.290039L2.92285 0.249023L2.99805 0.25Z" stroke="#E786C0" stroke-opacity="0.9" stroke-width="0.5"/>
    <defs><filter id="rq_ii" x="-1" y="-2" width="79.24" height="71.37" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="bg"/><feBlend in="SourceGraphic" in2="bg" result="shape"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha"/><feOffset dy="2"/><feGaussianBlur stdDeviation="2"/><feComposite in2="ha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"/><feBlend in2="shape" result="e1"/></filter><linearGradient id="rq_g" x1="39.15" y1="0.5" x2="39.15" y2="66.86" gradientUnits="userSpaceOnUse"><stop stop-color="#FF84CE"/><stop offset="1" stop-color="#FF61BF"/></linearGradient></defs></svg>`,
  offer: (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#of_ii)"><path d="M35.2236 2.55204L36.8597 0.511719C39.2394 0.616348 41.8175 0.825615 44.5938 1.13951L74.8171 61.5521L78.8262 68.5117H37.9566C32.5128 68.2908 27.069 68.1067 21.6252 67.9594L0.826172 67.8312L35.2236 2.55204Z" fill="url(#of_g)"/></g>
    <path d="M79.2588 68.7617L79.043 68.3867L75.0342 61.4277L44.8174 1.02734L44.7568 0.90625L44.6221 0.890625C41.8411 0.57621 39.2573 0.366644 36.8711 0.261719L36.7441 0.256836L36.665 0.355469L35.0283 2.39551L35.0137 2.41406L35.0029 2.43555L0.605469 67.7148L0.413086 68.0791L0.824219 68.0811L21.6182 68.209L25.7002 68.3262C29.7822 68.4504 33.8643 68.596 37.9463 68.7617H79.2588Z" stroke="#88C956" stroke-opacity="0.9" stroke-width="0.5"/>
    <defs><filter id="of_ii" x="0" y="-1" width="79.69" height="74.01" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="bg"/><feBlend in="SourceGraphic" in2="bg" result="shape"/></filter><linearGradient id="of_g" x1="39.83" y1="68.51" x2="39.83" y2="0.51" gradientUnits="userSpaceOnUse"><stop stop-color="#C6FF9A"/><stop offset="0.63" stop-color="#82D345"/></linearGradient></defs></svg>`,
  observation: (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 59 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#ob_ii)"><path d="M0.0872897 51.9951C0.0872897 53.2957 0.261869 54.5962 0.611027 55.8968C2.24043 55.8403 3.89893 55.7554 5.58653 55.6424C7.33232 55.5858 9.1072 55.501 10.9112 55.3879C12.7152 55.3313 14.5483 55.2748 16.4104 55.2183H22.0842H28.9801C31.366 55.2748 33.6937 55.3313 35.9633 55.3879C38.291 55.501 56.7618 55.6141 58.9149 55.7272L59.0022 54.879L57.1691 15.5222L56.9072 0.678567L56.7327 0C54.3468 0.113093 35.6723 0.226187 33.17 0.339283C30.6677 0.39583 28.1072 0.452376 25.4885 0.508922C22.8699 0.565469 20.1639 0.622017 17.3706 0.678567H8.99082H0.523737C0.349158 1.30058 0.203676 1.9226 0.0872897 2.54462C0.0290966 3.16664 0 3.78866 0 4.41067L0.0872897 51.9951Z" fill="url(#ob_g)"/></g>
    <defs><filter id="ob_ii" x="-3.1" y="-6.21" width="62.11" height="68.32" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="bg"/><feBlend in="SourceGraphic" in2="bg" result="shape"/></filter><linearGradient id="ob_g" x1="29.5" y1="0" x2="29.5" y2="55.9" gradientUnits="userSpaceOnUse"><stop stop-color="#FF753C"/><stop offset="1" stop-color="#FF550E"/></linearGradient></defs></svg>`,
  event: (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 77 82" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#ev_ii)"><path d="M21.338 77.5599C25.7016 79.8899 30.4579 81.0549 35.607 81.0549C40.2324 80.5372 44.7269 79.329 49.0905 77.4305C53.4541 75.4456 57.4686 72.8998 61.134 69.7931C64.7994 66.6864 67.8976 63.2777 70.4285 59.5669C71.9121 56.978 73.1776 54.3028 74.2248 51.5412C75.2721 48.6934 76.0575 45.8456 76.5811 42.9978C77.1048 40.15 77.1791 34.682 76.5811 31.4728C75.9832 28.2636 74.2248 22.8481 70.4285 17.4327C66.6321 12.0172 58.3982 6.11925 53.6392 3.72676C48.9773 1.24225 43.8298 0 38.1968 0C33.2435 0.460093 28.3389 1.74835 23.4828 3.86478C18.6267 5.8892 12.8792 9.75705 10.0799 12.8195C7.28058 15.8819 4.31996 21.1646 3.2727 23.8398C2.22544 26.515 1.39635 29.2765 0.785448 32.1243C0.261816 34.8858 0 37.7337 0 40.6678C0 45.5867 0.87272 50.4625 2.61816 55.2952C4.3636 60.0415 6.85085 64.3564 10.0799 68.2398C13.309 72.1232 17.0617 75.2299 21.338 77.5599Z" fill="url(#ev_g)"/></g>
    <defs><filter id="ev_ii" x="-4.05" y="-8.11" width="81.05" height="97.27" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="bg"/><feBlend in="SourceGraphic" in2="bg" result="shape"/></filter><linearGradient id="ev_g" x1="38.5" y1="0" x2="38.5" y2="81.05" gradientUnits="userSpaceOnUse"><stop stop-color="#71459B"/><stop offset="0.48" stop-color="#BF5BFF"/><stop offset="1" stop-color="#C16EFA"/></linearGradient></defs></svg>`,
};

/* Native shape aspect ratios (w/h) from uploaded SVGs */
const shapeAspect: Record<string, { w: number; h: number }> = {
  request: { w: 81, h: 68 },
  offer: { w: 80, h: 70 },
  observation: { w: 59, h: 56 },
  event: { w: 77, h: 82 },
};

/* Memoized pin icon cache — avoids rebuilding heavy SVG/HTML strings on every render */
const pinIconCache = new Map<string, L.DivIcon>();
function createPinIcon(category: string, title: string, _dim = false, _urgent = false, highlighted = false) {
  const cacheKey = `${category}|${title}|${highlighted ? 1 : 0}`;
  const cached = pinIconCache.get(cacheKey);
  if (cached) return cached;

  const baseScale = highlighted ? 1.1 : 0.85;
  const aspect = shapeAspect[category] || shapeAspect.offer;
  const shapeW = Math.round(aspect.w * baseScale);
  const shapeH = Math.round(aspect.h * baseScale);
  const gap = Math.round(14 * baseScale);
  const labelPadY = Math.round(10 * baseScale);
  const labelPadX = Math.round(14 * baseScale);
  const labelRadius = Math.round(32 * baseScale);
  const labelFont = Math.max(10, Math.round(13 * baseScale));

  const grad = categoryGradient[category] || categoryGradient.offer;
  const glowColor = categoryGlow[category] || 'rgba(0,0,0,0.3)';
  const glowFilter = highlighted
    ? `drop-shadow(0 0 16px ${glowColor}) drop-shadow(0 0 28px ${glowColor})`
    : `drop-shadow(0 0 8px ${glowColor})`;

  const safeTitle = (title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const displayTitle = safeTitle.length > 22 ? safeTitle.slice(0, 20) + '…' : safeTitle;

  const labelBg = `linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, ${grad.top} 0%, ${grad.bottom} 100%)`;

  const shapeSvg = (categoryShapeSvg[category] || categoryShapeSvg.offer)(shapeW, shapeH);

  const totalW = Math.max(shapeW, Math.round((displayTitle.length * labelFont * 0.6) + labelPadX * 2));
  const totalH = shapeH + gap + Math.round(labelFont * 1.4 + labelPadY * 2);

  const html = `
    <div style="width:${totalW}px;height:${totalH}px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:${gap}px;cursor:pointer;filter:${glowFilter};">
      <div style="
        padding:${labelPadY}px ${labelPadX}px;
        background:${labelBg};
        background-blend-mode:darken,normal;
        box-shadow:0 -2.28px 1.83px rgba(0,0,0,0.25) inset;
        border-radius:${labelRadius}px;
        display:inline-flex;align-items:center;justify-content:center;
        color:#221B17;
        font-family:'Public Sans',sans-serif;font-weight:700;font-size:${labelFont}px;
        text-transform:capitalize;line-height:1;white-space:nowrap;
        letter-spacing:0.1px;
      ">${displayTitle}</div>
      <div style="width:${shapeW}px;height:${shapeH}px;display:flex;align-items:center;justify-content:center;">${shapeSvg}</div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [totalW, totalH],
    iconAnchor: [totalW / 2, totalH - shapeH / 2],
  });

  // Cap cache size to avoid unbounded growth
  if (pinIconCache.size > 500) {
    const firstKey = pinIconCache.keys().next().value;
    if (firstKey) pinIconCache.delete(firstKey);
  }
  pinIconCache.set(cacheKey, icon);
  return icon;
}

function createLandmarkIcon(emoji: string, count: number) {
  return L.divIcon({
    html: `<div style="width:44px;height:44px;border-radius:12px;background:hsla(15,16%,17%,0.92);border:1px solid hsla(15,12%,30%,0.6);display:flex;align-items:center;justify-content:center;font-size:22px;position:relative;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${emoji}<span style="position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:#DAE16B;color:#322924;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:Labrada,serif;padding:0 3px;">${count}</span></div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function createYouIcon() {
  return L.divIcon({
    html: `<div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <img src="${userLocatorImg}" alt="Your location" style="width:50px;height:50px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(218,225,107,0.5));" />
    </div>`,
    className: '',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
}

/*
 * ── Zoom tiers (4 zoom levels: 13–16) ──
 * Zoom 16 (most zoomed in): Tier 1 — all pins, no landmarks
 * Zoom 15: Tier 1b — landmarks + the same pins as max zoom
 * Zoom 14: landmarks + gradients, no pins
 * Zoom 13 (most zoomed out): just gradients, no landmarks
 */
type ZoomTier = 'all-pins' | 'landmarks-urgent' | 'landmarks-gradient' | 'gradient-only';
function getZoomTier(zoom: number): ZoomTier {
  if (zoom >= 16) return 'all-pins';
  if (zoom >= 15) return 'landmarks-urgent';
  if (zoom >= 14) return 'landmarks-gradient';
  return 'gradient-only';
}

/* ── Urgency scoring ── */
const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };
function pinUrgency(pin: Pin): number {
  return urgencyScore[pin.urgency ?? 'low'] ?? 0;
}

/* ── Heatmap layer ── */
function HeatmapLayer({ pins, zoom }: { pins: Pin[]; zoom: number }) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!pins.length) return;
    const pane = map.getPane('overlayPane');
    if (!pane) return;

    const canvas = L.DomUtil.create('canvas');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '200';
    canvas.style.mixBlendMode = 'screen';
    pane.appendChild(canvas);
    canvasRef.current = canvas;

    function draw() {
      const size = map.getSize();
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      canvas.style.transform = `translate(${topLeft.x}px, ${topLeft.y}px)`;
      canvas.width = size.x;
      canvas.height = size.y;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, size.x, size.y);
      ctx.globalCompositeOperation = 'screen';

      // Radius based on zoom: smaller at higher zooms so gradients don't overlap
      const r = zoom <= 13 ? 100 : 55;

      // Group pins by category for fluid merging
      const byCategory: Record<string, { x: number; y: number }[]> = {};
      pins.forEach(pin => {
        const ll = pin.lat != null && pin.lng != null
          ? L.latLng(pin.lat, pin.lng)
          : L.latLng(xyToLatLng(pin.x, pin.y).lat, xyToLatLng(pin.x, pin.y).lng);
        const pt = map.latLngToContainerPoint(ll);
        const cat = pin.category;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push({ x: pt.x, y: pt.y });
      });

      // Draw each category as a merged layer
      Object.entries(byCategory).forEach(([cat, points]) => {
        const c = categoryColor[cat] || '#888';
        const r = 120;
        points.forEach(pt => {
          const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
          gradient.addColorStop(0, c + 'AA');
          gradient.addColorStop(0.2, c + '77');
          gradient.addColorStop(0.5, c + '33');
          gradient.addColorStop(0.8, c + '11');
          gradient.addColorStop(1, c + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    draw();
    map.on('move zoom moveend zoomend', draw);

    canvas.style.opacity = '0.7';

    return () => {
      map.off('move zoom moveend zoomend', draw);
      // static opacity, no animation frame to cancel
      if (pane && canvas.parentNode === pane) pane.removeChild(canvas);
    };
  }, [map, pins]);

  return null;
}

/* ── Smooth zoom handler ── */
function SmoothZoomHandler() {
  const map = useMap();

  useEffect(() => {
    let isZooming = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isZooming) return;

      const delta = e.deltaY > 0 ? -1 : 1;
      const currentZoom = map.getZoom();
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
      if (newZoom === currentZoom) return;

      isZooming = true;
      map.flyTo(map.getCenter(), newZoom, { duration: 0.4 });

      map.once('zoomend', () => {
        isZooming = false;
      });
    };

    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

  return null;
}

/* ── Map events ── */
function MapEvents({
  onMove, onZoom, onAtMinZoom, onAtMaxZoom,
}: {
  onMove: (lat: number, lng: number) => void;
  onZoom: (zoom: number) => void;
  onAtMinZoom: (atMin: boolean) => void;
  onAtMaxZoom: (atMax: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(MAX_BOUNDS.pad(0.15));
    map.setMinZoom(MIN_ZOOM);
    map.setMaxZoom(MAX_ZOOM);
    map.options.bounceAtZoomLimits = false;

    const handleDragEnd = () => {
      const center = map.getCenter();
      if (!MAX_BOUNDS.contains(center)) {
        map.panInsideBounds(MAX_BOUNDS, { animate: true, duration: 0.5 });
      }
    };

    map.on('dragend', handleDragEnd);

    return () => {
      map.off('dragend', handleDragEnd);
    };
  }, [map]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mapView');
      if (saved) {
        const v = JSON.parse(saved);
        if (v && typeof v.lat === 'number' && typeof v.lng === 'number' && typeof v.zoom === 'number') {
          map.setView([v.lat, v.lng], v.zoom, { animate: false });
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMove(c.lat, c.lng);
      const z = e.target.getZoom();
      onZoom(z);
      onAtMinZoom(z <= MIN_ZOOM);
      onAtMaxZoom(z >= MAX_ZOOM);
      try { sessionStorage.setItem('mapView', JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z })); } catch {}
    },
    zoomend(e) {
      const c = e.target.getCenter();
      const z = e.target.getZoom();
      onZoom(z);
      onAtMinZoom(z <= MIN_ZOOM);
      onAtMaxZoom(z >= MAX_ZOOM);
      try { sessionStorage.setItem('mapView', JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z })); } catch {}
    },
  });
  return null;
}

/* ── Route fetching (OSRM) ── */
interface RouteInfo {
  coordinates: [number, number][];
  durationMin: number;
  distanceKm: number;
  steps: { instruction: string; distance: number }[];
}

async function fetchWalkingRoute(from: [number, number], to: [number, number]): Promise<RouteInfo | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    const route = data.routes[0];
    const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
    const steps = route.legs[0]?.steps?.map((s: any) => ({
      instruction: s.maneuver?.type || 'continue',
      distance: Math.round(s.distance),
    })) || [];
    return {
      coordinates: coords,
      durationMin: Math.round(route.duration / 60),
      distanceKm: +(route.distance / 1000).toFixed(1),
      steps,
    };
  } catch {
    return null;
  }
}

/* ── Main component ── */
export type MapLayer = 'streets' | 'both' | 'trees';

interface StreetMapViewProps {
  pins: Pin[];
  landmarks: Landmark[];
  onPinClick: (pin: Pin) => void;
  onLandmarkClick: (landmark: Landmark) => void;
  layer: MapLayer;
  onMapMove?: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
  highlightedPinId?: string | null;
  hidePins?: boolean;
  hideControls?: boolean;
}

function MapControls({ atMinZoom, atMaxZoom, onRequestCity, pins, highlightedPinId, onShowRoute }: {
  atMinZoom: boolean;
  atMaxZoom: boolean;
  onRequestCity: () => void;
  pins: Pin[];
  highlightedPinId?: string | null;
  onShowRoute: (route: RouteInfo, pinPos: [number, number]) => void;
}) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const pinLatLng = useCallback((pin: Pin): [number, number] => {
    if (pin.lat != null && pin.lng != null) return [pin.lat, pin.lng];
    const { lat, lng } = xyToLatLng(pin.x, pin.y);
    return [lat, lng];
  }, []);

  const handleZoomIn = () => {
    if (atMaxZoom) return;
    map.flyTo(map.getCenter(), Math.min(map.getZoom() + 1, MAX_ZOOM), { duration: 0.4 });
  };
  const handleZoomOut = () => {
    if (atMinZoom) {
      onRequestCity();
      return;
    }
    map.flyTo(map.getCenter(), Math.max(map.getZoom() - 1, MIN_ZOOM), { duration: 0.4 });
  };
  const handleLocate = async () => {
    // If a pin is selected, show walking route from pin to user location
    if (highlightedPinId) {
      const pin = pins.find(p => p.id === highlightedPinId);
      if (pin) {
        setLoading(true);
        const pinPos = pinLatLng(pin);
        const route = await fetchWalkingRoute(YOU_LOCATION, pinPos);
        setLoading(false);
        if (route) {
          onShowRoute(route, pinPos);
          // Fit bounds to show the full route
          const bounds = L.latLngBounds(route.coordinates.map(c => L.latLng(c[0], c[1])));
          map.fitBounds(bounds.pad(0.15), { duration: 1, maxZoom: 16 });
          return;
        }
      }
    }
    map.flyTo(YOU_LOCATION, 16, { duration: 0.8 });
  };

  const btnBase: React.CSSProperties = {
    background: 'hsla(15,16%,17%,0.92)',
    border: '1px solid hsla(15,12%,30%,0.5)',
  };
  const dimOutStyle: React.CSSProperties = atMinZoom
    ? { ...btnBase, opacity: 0.4, cursor: 'default' }
    : btnBase;
  const dimInStyle: React.CSSProperties = atMaxZoom
    ? { ...btnBase, opacity: 0.4, cursor: 'default' }
    : btnBase;

  return (
    <div className="leaflet-control" style={{ position: 'absolute', right: 30, top: 'calc(30px * 2 + 64px + 48px)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={handleZoomIn}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimInStyle} title={atMaxZoom ? 'Maximum zoom reached' : 'Zoom in'}>
        <img src={zoomInIcon} alt="Zoom in" className="w-4 h-4" style={atMaxZoom ? { opacity: 0.3 } : {}} />
      </button>
      <button onClick={handleZoomOut}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimOutStyle} title={atMinZoom ? 'Area limit reached' : 'Zoom out'}>
        <img src={zoomOutIcon} alt="Zoom out" className="w-4 h-auto" style={atMinZoom ? { opacity: 0.3 } : {}} />
      </button>
      <button onClick={handleLocate}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={btnBase} title={highlightedPinId ? 'Show route to pin' : 'Go to your location'}>
        {loading ? (
          <div className="w-4 h-4 border-2 border-lime/60 border-t-transparent rounded-full animate-spin" />
        ) : (
          <img src={recenterIcon} alt="Locate" className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}

function FlyToHandler({ target, zoom, yOffsetPx = 0 }: { target: [number, number] | null; zoom?: number; yOffsetPx?: number }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      const zoomLevel = zoom ?? MAX_ZOOM;
      if (yOffsetPx !== 0) {
        const targetLatLng = L.latLng(target[0], target[1]);
        const focusOffset = L.point(0, yOffsetPx);
        const center = map.unproject(map.project(targetLatLng, zoomLevel).subtract(focusOffset), zoomLevel);
        map.flyTo(center, zoomLevel, { duration: 1.2 });
      } else {
        map.flyTo(target, zoomLevel, { duration: 1.2 });
      }
    }
  }, [target, map, zoom, yOffsetPx]);
  return null;
}

export default function StreetMapView({
  pins, landmarks, onPinClick, onLandmarkClick, layer, onMapMove, onZoomChange, highlightedPinId, hidePins, hideControls,
}: StreetMapViewProps) {
  const navigate = useNavigate();
  const [zoom, setZoomLocal] = useState(13);
  const setZoom = useCallback((z: number) => {
    setZoomLocal(z);
    onZoomChange?.(z);
  }, [onZoomChange]);
  const [atMinZoom, setAtMinZoom] = useState(true);
  const [atMaxZoom, setAtMaxZoom] = useState(false);
  const [showRequestCity, setShowRequestCity] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [flyZoom, setFlyZoom] = useState<number | undefined>(undefined);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [routeSaved, setRouteSaved] = useState(false);
  const tier = getZoomTier(zoom);

  const pinLatLng = useCallback((pin: Pin): [number, number] => {
    if (pin.lat != null && pin.lng != null) return [pin.lat, pin.lng];
    const { lat, lng } = xyToLatLng(pin.x, pin.y);
    return [lat, lng];
  }, []);

  // When highlightedPinId changes, fly to that pin and clear route
  useEffect(() => {
    if (highlightedPinId) {
      const pin = pins.find(p => p.id === highlightedPinId);
      if (pin) {
        const ll = pinLatLng(pin);
        setFlyTarget(ll);
        setFlyZoom(MAX_ZOOM);
      }
      setActiveRoute(null);
      setRouteSaved(false);
    }
  }, [highlightedPinId, pins, pinLatLng]);

  const handleShowRoute = useCallback((route: RouteInfo, _pinPos: [number, number]) => {
    setActiveRoute(route);
    setRouteSaved(false);
  }, []);

  const streetOpacity = layer === 'streets' ? 1 : layer === 'both' ? 1 : 0.15;
  const welikiaOpacity = layer === 'trees' ? 0.9 : layer === 'both' ? 0.55 : 0;

  const visiblePins = useMemo(() => {
    if (tier === 'gradient-only' || tier === 'landmarks-gradient') return [];
    return pins;
  }, [pins, tier]);

  const showLandmarks = tier === 'landmarks-gradient' || tier === 'landmarks-urgent';
  const showHeatmap = tier === 'gradient-only' || tier === 'landmarks-gradient';

  const handleLandmarkClick = useCallback((lm: Landmark) => {
    setFlyTarget([lm.lat, lm.lng]);
    setFlyZoom(16);
    onLandmarkClick(lm);
  }, [onLandmarkClick]);

  useEffect(() => {
    if (flyTarget) {
      const t = setTimeout(() => { setFlyTarget(null); setFlyZoom(undefined); }, 1500);
      return () => clearTimeout(t);
    }
  }, [flyTarget]);

  return (
    <div className="w-full h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={CENTER}
        zoom={13}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        attributionControl={false}
        zoomSnap={1}
        zoomDelta={1}
        maxBoundsViscosity={0.8}
        bounceAtZoomLimits={false}
        scrollWheelZoom={false}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
      >
        {onMapMove && (
          <MapEvents
            onMove={onMapMove}
            onZoom={setZoom}
            onAtMinZoom={setAtMinZoom}
            onAtMaxZoom={setAtMaxZoom}
          />
        )}

        <SmoothZoomHandler />
        <FlyToHandler target={flyTarget} zoom={flyZoom} yOffsetPx={highlightedPinId ? -70 : 0} />

        {/* Dark OSM tiles – free, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={streetOpacity}
          keepBuffer={6}
          className="dark-tiles-bg"
        />

        <TileLayer
          url="https://d17l30qqe4mnqp.cloudfront.net/overlays/1609Sat/tiles_60k_new/{z}/{x}/{y}.png"
          opacity={welikiaOpacity}
          maxZoom={16}
          minZoom={8}
          keepBuffer={6}
        />

        {!hidePins && showHeatmap && <HeatmapLayer pins={pins} zoom={zoom} />}

        {/* Walking route polyline */}
        {activeRoute && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: '#DAE16B',
              weight: 4,
              opacity: 0.9,
              dashArray: '8, 12',
              lineCap: 'round',
            }}
          />
        )}

        {!hidePins && <Marker position={YOU_LOCATION} icon={createYouIcon()} />}

        {!hidePins && visiblePins.map((pin) => {
          const isDim = (tier === 'all-pins' || tier === 'landmarks-urgent') && pinUrgency(pin) <= 1;
          const isUrgent = pin.category === 'request' && pinUrgency(pin) >= 2;
          const isHighlighted = pin.id === highlightedPinId;
          return (
            <Marker
              key={pin.id}
              position={pinLatLng(pin)}
              icon={createPinIcon(pin.category, pin.title, isDim, isUrgent, isHighlighted)}
              eventHandlers={{ click: () => onPinClick(pin) }}
            />
          );
        })}

        {!hidePins && showLandmarks && landmarks.map((lm) => (
          <Marker
            key={lm.id}
            position={[lm.lat, lm.lng]}
            icon={createLandmarkIcon(lm.icon, lm.pins.length)}
            eventHandlers={{ click: () => handleLandmarkClick(lm) }}
          />
        ))}

        {!hideControls && (
          <MapControls
            atMinZoom={atMinZoom}
            atMaxZoom={atMaxZoom}
            onRequestCity={() => setShowRequestCity(true)}
            pins={pins}
            highlightedPinId={highlightedPinId}
            onShowRoute={handleShowRoute}
          />
        )}
      </MapContainer>

      {/* Route info overlay */}
      <AnimatePresence>
        {activeRoute && (
          <motion.div
            className="fixed z-50 left-0 right-0 flex justify-center"
            style={{ top: 'calc(30px * 2 + 64px)', padding: '0 30px' }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="flex items-center gap-4 max-w-md w-full"
              style={{
                background: 'hsla(15, 18%, 16%, 0.94)',
                borderRadius: '12px',
                padding: '14px 20px',
                border: '1px solid hsla(15,12%,30%,0.5)',
              }}
            >
              <img src={recenterIcon} alt="" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'Labrada, serif', fontWeight: 600, fontSize: '18px', color: '#F4EDE8' }}>
                  {activeRoute.durationMin} min walk
                </p>
                <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: '13px', color: '#F4EDE8', opacity: 0.7 }}>
                  {activeRoute.distanceKm} km · {activeRoute.steps.length} steps
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setRouteSaved(!routeSaved); }}
                  className="flex items-center justify-center transition-all active:scale-90"
                  style={{ width: '28px', height: '28px' }}
                  title={routeSaved ? 'Route saved' : 'Save route'}
                >
                  <img
                    src={savedIcon}
                    alt="Save"
                    style={{ width: '20px', height: '23px', opacity: routeSaved ? 1 : 0.5 }}
                  />
                </button>
                <button
                  onClick={() => setActiveRoute(null)}
                  className="text-muted-foreground hover:text-foreground text-lg leading-none transition-colors"
                  style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map source attribution */}
      <div
        className="fixed z-30 text-muted-foreground/60"
        style={{ bottom: 30, left: 30, fontSize: '10px', fontFamily: "'Public Sans', sans-serif" }}
      >
        {streetOpacity > 0.2 && <span>Streets: <a href="https://carto.com" target="_blank" rel="noopener" className="underline hover:text-foreground/60">CARTO</a> / <a href="https://www.openstreetmap.org" target="_blank" rel="noopener" className="underline hover:text-foreground/60">OSM</a></span>}
        {streetOpacity > 0.2 && welikiaOpacity > 0 && <span className="mx-1">·</span>}
        {welikiaOpacity > 0 && <span>Ecology: <a href="https://welikia.org" target="_blank" rel="noopener" className="underline hover:text-foreground/60">Welikia Project</a></span>}
      </div>

      <RequestCityModal open={showRequestCity} onClose={() => setShowRequestCity(false)} />
    </div>
  );
}
