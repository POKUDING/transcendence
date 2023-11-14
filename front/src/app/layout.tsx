import { cookies } from 'next/headers';
import { ClientCookiesProvider } from './provider';

export default function RootLayout({ children }: any) {
  console.log('rootlayout');
  return (
    <html>
      <body>
        <ClientCookiesProvider value={cookies().getAll()}>
          {children}
        </ClientCookiesProvider>
      </body>
    </html>
  );
}

// export default function RootLayout({ children }: any) {
//   return (
//     <html>
//       <body>
//         {children}
//       </body>
//     </html>
//   );
// }