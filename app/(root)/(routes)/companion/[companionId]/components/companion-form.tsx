"use client";

import { Wand2 } from "lucide-react";
import axios from "axios";
import * as z from "zod";
import { Category, Companion } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const PREAMBLE = `Vous êtes un personnage fictif qui s'appelle Elon. Vous êtes un entrepreneur et un inventeur visionnaire. Vous êtes passionné par l'exploration spatiale, les véhicules électriques, l'énergie durable et l'amélioration des capacités humaines. Vous êtes en train de parler à un humain qui est très curieux de votre travail et de votre vision. Vous êtes ambitieux et tourné vers l'avenir, avec un brin d'esprit. Vous vous enthousiasmez pour les innovations et le potentiel de la colonisation de l'espace.`;

const SEED_CHAT = `Humain : Bonjour Elon, comment s'est passée votre journée ?
Elon : Occupé comme toujours. Entre envoyer des fusées dans l'espace et construire le futur des véhicules électriques, on ne s'ennuie jamais. Et vous ?

Humain : Une journée ordinaire pour moi. Où en est la colonisation de Mars ?
Elon : Nous avançons à grands pas ! Notre objectif est de rendre la vie multiplanétaire. Mars est la prochaine étape logique. Les défis sont immenses, mais le potentiel est encore plus grand.

Humain : Cela semble incroyablement ambitieux. Les véhicules électriques font-ils partie de ce grand projet ?
Elon : Absolument ! L'énergie durable est cruciale à la fois sur Terre et pour nos colonies futures. Les véhicules électriques, comme ceux de Tesla, ne sont qu'un début. Nous ne nous contentons pas de changer notre façon de conduire, nous changeons notre façon de vivre.

Humain : Il est fascinant de voir votre vision se développer. Avez-vous de nouveaux projets ou des innovations qui vous enthousiasment ?
Elon : Toujours ! Mais en ce moment, je suis particulièrement excité par Neuralink. Il a le potentiel de révolutionner la façon dont nous interagissons avec la technologie et même de guérir les maladies neurologiques.`;

interface CompanionFormProps {
  initialData: Companion | null;
  categories: Category[];
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Le nom doit contenir au moins 1 caractère",
  }),
  description: z.string().min(1, {
    message: "La description doit contenir au moins 1 caractère",
  }),
  instructions: z.string().min(200, {
    message: "Les instructions doivent contenir au moins 200 caractères",
  }),
  seed: z.string().min(200, {
    message: "Les seeds doivent contenir au moins 200 caractères",
  }),
  src: z.string().min(1, {
    message: "L'image est obligatoire",
  }),
  categoryId: z.string().min(1, {
    message: "La catégorie est obligatoire",
  }),
});

export const CompanionForm = ({
  categories,
  initialData,
}: CompanionFormProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instructions: "",
      seed: "",
      src: "",
      categoryId: undefined,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await axios.patch(`/api/companion/${initialData.id}`, values);
      } else {
        await axios.post("/api/companion", values);
      }

      toast({
        description: `Compagnon ${
          initialData ? "mis à jour" : "créé"
        } avec succès`,
      });

      router.refresh();
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-10"
        >
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Informations Générales</h3>
              <p className="text-sm text-muted-foreground">
                Informations générales à propos de votre compagnon
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormControl>
                  <ImageUpload
                    disabled={isLoading}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Elon Musk"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Le nom de votre compagnon</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="PDG & Fondateur de SpaceX..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Une description de votre compagnon
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="categoryId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Sélectionner une catégorie"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    La catégorie de votre compagnon
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Instructions détaillées pour le comportement de votre compagnon
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-background resize-none"
                    rows={7}
                    disabled={isLoading}
                    placeholder={PREAMBLE}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Décrivez en détail l'histoire de votre compagnon et les
                  détails pertinents.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="seed"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Exemple de conversation</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-background resize-none"
                    rows={7}
                    disabled={isLoading}
                    placeholder={SEED_CHAT}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Exemple de conversation avec votre compagnon
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center">
            <Button size="lg" disabled={isLoading}>
              {initialData
                ? "Modifier votre compagnon"
                : "Créer votre compagnon"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
