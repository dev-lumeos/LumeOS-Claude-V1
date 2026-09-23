// Type definitions for Next.js routes

/**
 * Internal types used by the Next.js router and Link component.
 * These types are not meant to be used directly.
 * @internal
 */
declare namespace __next_route_internal_types__ {
  type SearchOrHash = `?${string}` | `#${string}`
  type WithProtocol = `${string}:${string}`

  type Suffix = '' | SearchOrHash

  type SafeSlug<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type CatchAllSlug<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type OptionalCatchAllSlug<S extends string> =
    S extends `${string}${SearchOrHash}` ? never : S

  type StaticRoutes = 
    | `/`
    | `/auth/abmelden`
    | `/auth/callback`
    | `/coach`
    | `/api/medical/wirkstoff`
    | `/api/allergien/vorschlaege`
    | `/api/supplements/daumen`
    | `/api/supplements/filter`
    | `/api/supplements/meidestoffe`
    | `/api/supplements/intake`
    | `/api/supplements/produkte`
    | `/api/supplements/produkt`
    | `/api/supplements/marken`
    | `/api/supplements/substanz`
    | `/api/profile`
    | `/api/profile/ziele`
    | `/api/nutrition/ansicht`
    | `/api/nutrition/diary`
    | `/api/nutrition/local-schema`
    | `/api/nutrition/plan`
    | `/api/nutrition/naehrstoff`
    | `/api/nutrition/preferences`
    | `/api/nutrition/preferences/catalog`
    | `/api/nutrition/foods`
    | `/api/nutrition/foods/categories`
    | `/api/nutrition/foods/smart-preview`
    | `/api/nutrition/rezept`
    | `/api/nutrition/water`
    | `/dashboard`
    | `/goals`
    | `/login`
    | `/medical`
    | `/nutrition`
    | `/nutrition/foods`
    | `/nutrition/local-schema`
    | `/nutrition/preferences`
    | `/settings`
    | `/recovery`
    | `/supplements`
    | `/training`
    | `/v2`
    | `/v2/goals`
    | `/v2/coach`
    | `/v2/coach/ai`
    | `/v2/coach/human`
    | `/v2/medical`
    | `/v2/nutrition`
    | `/v2/nutrition/suche`
    | `/v2/settings`
    | `/v2/recovery`
    | `/v2/dashboard`
    | `/v2/supplements`
    | `/v2/training`
  type DynamicRoutes<T extends string = string> = never

  type RouteImpl<T> = 
    | StaticRoutes
    | SearchOrHash
    | WithProtocol
    | `${StaticRoutes}${SearchOrHash}`
    | (T extends `${DynamicRoutes<infer _>}${Suffix}` ? T : never)
    
}

declare module 'next' {
  export { default } from 'next/types/index.js'
  export * from 'next/types/index.js'

  export type Route<T extends string = string> =
    __next_route_internal_types__.RouteImpl<T>
}

declare module 'next/link' {
  import type { LinkProps as OriginalLinkProps } from 'next/dist/client/link.js'
  import type { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'
  import type { UrlObject } from 'url'

  type LinkRestProps = Omit<
    Omit<
      DetailedHTMLProps<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >,
      keyof OriginalLinkProps
    > &
      OriginalLinkProps,
    'href'
  >

  export type LinkProps<RouteInferType> = LinkRestProps & {
    /**
     * The path or URL to navigate to. This is the only required prop. It can also be an object.
     * @see https://nextjs.org/docs/api-reference/next/link
     */
    href: __next_route_internal_types__.RouteImpl<RouteInferType> | UrlObject
  }

  export default function Link<RouteType>(props: LinkProps<RouteType>): JSX.Element
}

declare module 'next/navigation' {
  export * from 'next/dist/client/components/navigation.js'

  import type { NavigateOptions, AppRouterInstance as OriginalAppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime.js'
  interface AppRouterInstance extends OriginalAppRouterInstance {
    /**
     * Navigate to the provided href.
     * Pushes a new history entry.
     */
    push<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Navigate to the provided href.
     * Replaces the current history entry.
     */
    replace<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Prefetch the provided href.
     */
    prefetch<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>): void
  }

  export declare function useRouter(): AppRouterInstance;
}
