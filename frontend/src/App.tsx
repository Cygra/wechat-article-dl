import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "./lib/utils";

const formSchema = z.object({
  link: z.string().url(),
  width: z.string(),
});

function App() {
  const [imageSrc, setImageSrc] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: "",
    },
  });

  const onSubmit = async ({ link, width }: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setImageSrc("");

      const res = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link,
          width: Number(width),
        }),
      });

      const {
        image,
        accountTitle,
        title,
        width: imageWidth,
      } = await res.json();
      toast.success(`${accountTitle}-${title} 下载成功！`, {
        position: "top-center",
      });
      setImageSrc(image);
      setImageWidth(imageWidth);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden items-stretch">
      <div
        className={cn("p-4 flex flex-col items-center justify-center", {
          "border-r-2 border-gray-400": !!imageSrc,
          "flex-1": !imageSrc,
        })}
      >
        <h1>微信公众号文章下载</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-sm"
          >
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>文章链接</FormLabel>
                  <FormControl>
                    <Input placeholder="公众号文章链接" {...field} />
                  </FormControl>
                  <FormDescription>请输入微信公众号文章链接</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>页面宽度</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择页面宽度" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="430">430px - 适合手机浏览</SelectItem>
                      <SelectItem value="1600">
                        1600px - 适合电脑浏览
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" />}
              Submit
            </Button>
          </form>
        </Form>
      </div>
      <div
        className={cn("flex-1 overflow-y-hidden flex justify-center", {
          hidden: !imageSrc,
        })}
      >
        <div className="w-full h-auto overflow-y-auto ">
          {imageSrc && (
            <img
              src={imageSrc}
              className={`max-w-${
                imageWidth || 430
              }px block h-auto my-0 mx-auto`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
