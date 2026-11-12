"use client";

//Piezas que solo se entienden si se pueden tocar: pestañas, diálogos y avisos.
//Es la gran ventaja de tener el sticker sheet dentro de la app en vez de en un PDF:
//aquí el hover, el foco y la animación son los de verdad.

import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Toaster } from "~/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { BOTON } from "./botones";
import { Grid, Group, Note, Section, Specimen } from "./parts";

export function InteractiveSection() {
  return (
    <Section
      id="interaccion"
      title="Navegación e interacción"
      description="Pruébalas: estas piezas solo se evalúan bien tocándolas."
    >
      {/* Montamos el Toaster aquí mismo para poder demostrar los avisos —
          es justo lo que hay que hacer una vez en el layout real antes de usar toast(). */}
      <Toaster position="bottom-center" />

      <Group
        title="Pestañas"
        hint="Dos variantes: default (fondo) para cambiar de vista, line (subrayado) para secciones de perfil."
      >
        <Grid>
          <Specimen
            label="variant default"
            code={`<TabsList variant="default">`}
          >
            <Tabs defaultValue="pedidos" className="w-full">
              <TabsList>
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
                <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
              </TabsList>
              <TabsContent
                value="pedidos"
                className="text-muted-foreground pt-2"
              >
                Contenido de pedidos.
              </TabsContent>
              <TabsContent
                value="catalogo"
                className="text-muted-foreground pt-2"
              >
                Contenido del catálogo.
              </TabsContent>
              <TabsContent
                value="mensajes"
                className="text-muted-foreground pt-2"
              >
                Contenido de mensajes.
              </TabsContent>
            </Tabs>
          </Specimen>

          <Specimen label="variant line" code={`<TabsList variant="line">`}>
            <Tabs defaultValue="obra" className="w-full">
              <TabsList variant="line">
                <TabsTrigger value="obra">Obra</TabsTrigger>
                <TabsTrigger value="sobre">Sobre mí</TabsTrigger>
              </TabsList>
              <TabsContent value="obra" className="text-muted-foreground pt-2">
                Rejilla de productos.
              </TabsContent>
              <TabsContent value="sobre" className="text-muted-foreground pt-2">
                Texto de la artesana.
              </TabsContent>
            </Tabs>
          </Specimen>
        </Grid>
      </Group>

      <Group
        title="Diálogo de confirmación"
        hint="Patrón fijo: título que nombra la acción, descripción con la consecuencia, cancelar a la izquierda y la acción destructiva a la derecha."
      >
        <Specimen
          label="Dialog + confirmación destructiva"
          code="Dialog > DialogTrigger > DialogContent > DialogHeader + DialogFooter"
        >
          <Dialog>
            <DialogTrigger
              render={<button type="button" className={BOTON.peligro} />}
            >
              Eliminar producto
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar este producto?</DialogTitle>
                <DialogDescription>
                  Se quitará del catálogo y de tu perfil público. Esta acción no
                  se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose
                  render={<button type="button" className={BOTON.secundario} />}
                >
                  Cancelar
                </DialogClose>
                <DialogClose
                  onClick={() =>
                    toast.success("Producto eliminado (demostración)")
                  }
                  render={
                    <button type="button" className={BOTON.peligroSolido} />
                  }
                >
                  Sí, eliminar
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Specimen>
        <Note>
          La acción destructiva va <strong>a la derecha</strong> y en sólido;
          cancelar a la izquierda y en gris. Invertirlo entre pantallas es la
          forma más rápida de que alguien borre algo sin querer.
        </Note>
      </Group>

      <Group
        title="Avisos (toast)"
        hint="Confirmaciones breves de acciones que ya han ocurrido. Nunca para errores que requieran decisión."
      >
        <Specimen
          label="toast() de sonner"
          code={`import { toast } from "sonner"; toast.success("…")`}
        >
          <Button
            variant="outline"
            onClick={() => toast.success("Pedido confirmado")}
          >
            success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("No se pudo guardar")}
          >
            error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Tienes un mensaje nuevo")}
          >
            info
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Quedan 2 horas de plazo")}
          >
            warning
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              //Un toast.loading() que nadie resuelve se queda pegado en pantalla para
              //siempre. La forma real de usarlo: guardar el id y resolverlo con el mismo
              //id cuando la operación termina — aquí, una espera de mentira de 1,5s.
              const id = toast.loading("Subiendo fotos…");
              setTimeout(() => toast.success("Fotos subidas", { id }), 1500);
            }}
          >
            loading
          </Button>
        </Specimen>
        <Note>
          Para que <code>toast()</code> funcione en una pantalla, tiene que
          existir un <code>&lt;Toaster /&gt;</code> montado en algún layout por
          encima — solo hace falta uno para toda la app.
        </Note>
      </Group>

      <Group
        title="Barras de navegación"
        hint="No se pueden mostrar aquí porque dependen de la sesión y van en posición fija."
      >
        <div className="border-border bg-card text-muted-foreground space-y-2 rounded-xl border p-4 text-xs">
          <p>
            <code className="text-foreground">AppHeader</code> — cabecera
            global. Se ve en cualquier página pública.
          </p>
          <p>
            <code className="text-foreground">ArtisanBottomNav</code> —
            navegación inferior de la artesana en móvil. Se ve en{" "}
            <code>/studio</code>.
          </p>
          <p>
            <code className="text-foreground">AppFooter</code> /{" "}
            <code>ConditionalFooter</code> — pie global.
          </p>
        </div>
      </Group>
    </Section>
  );
}
