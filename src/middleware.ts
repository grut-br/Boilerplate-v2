import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // Checagem de Ambiente para degradação suave (Híbrido)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(" Supabase Keys não encontradas. Middleware rodando em modo Pass-through (Apenas Frontend).");
    if (isProtectedRoute) {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 1. Atualizar cookies da sessão
  const response = await updateSession(request);

  // 2. Instanciar cliente do Supabase temporário para verificação de permissão no Middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Regra de proteção: redirecionar para /login se tentar acessar o dashboard sem autenticação
  if (isProtectedRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Capturar todas as rotas de requisição exceto:
     * - arquivos estáticos (_next/static)
     * - imagens otimizadas (_next/image)
     * - favicon (favicon.ico)
     * - extensões comuns de imagens (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
