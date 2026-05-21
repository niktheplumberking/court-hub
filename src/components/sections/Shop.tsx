"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionHeadline } from "@/components/ui/SectionHeadline";
import { FilterTabs } from "@/components/shop/FilterTabs";
import { ProductCard } from "@/components/shop/ProductCard";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import {
  categories,
  filterProducts,
  products,
  type Category,
} from "@/lib/products";

export function Shop() {
  const [active, setActive] = useState<Category>("HEAD");
  const visible = filterProducts(products, active);

  return (
    <section id="shop" className="relative bg-ink">
      <ContainerScroll titleComponent={<ShopHeadline />}>
        <FeaturedPlaceholder />
      </ContainerScroll>

      <Container className="pb-32 sm:pb-40 lg:pb-48">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel accent="lime">The Rack</SectionLabel>
            <SectionHeadline
              as="h3"
              className="font-display mt-4 text-3xl leading-tight sm:text-4xl"
            >
              Filter by brand.
            </SectionHeadline>
          </div>
          <FilterTabs
            categories={categories}
            active={active}
            onChange={setActive}
          />
        </div>

        <div className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visible.length === 0 && (
          <p className="mt-12 text-center text-white/40">
            Nothing here yet. Check back soon.
          </p>
        )}
      </Container>
    </section>
  );
}

function ShopHeadline() {
  return (
    <div className="mx-auto max-w-3xl px-4 text-center">
      <div className="mb-6 flex justify-center">
        <SectionLabel accent="lime">The Shop</SectionLabel>
      </div>
      <SectionHeadline className="font-display text-[10vw] leading-[0.95] tracking-tight sm:text-[6vw] lg:text-[4.5vw]">
        The paddles{" "}
        <span className="text-lime">the pros play with.</span>
      </SectionHeadline>
      <p className="mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg">
        Authorized retailer for HEAD and Wilson. Hand-selected pre-owned
        inventory, certified by our team.
      </p>
    </div>
  );
}

function FeaturedPlaceholder() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gray-800 p-6">
      <div className="grid w-full gap-6 sm:grid-cols-2">
        <div className="aspect-square w-full rounded-2xl bg-gray-700/60 ring-1 ring-white/10" />
        <div className="flex flex-col justify-center gap-4 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-lime">
            Featured · HEAD
          </span>
          <h3 className="font-display text-3xl leading-tight text-white sm:text-5xl">
            Speed Motion 2024
          </h3>
          <p className="text-sm text-white/60 sm:text-base">
            Power on the smash, precision on the bandeja. The paddle Tapia
            takes to championship Sundays.
          </p>
          <span className="font-display text-2xl text-white sm:text-3xl">
            AED 1,049
          </span>
        </div>
      </div>
    </div>
  );
}
