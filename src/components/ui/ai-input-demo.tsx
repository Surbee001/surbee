import { AIInput } from "@/components/ui/ai-input"

export function AIInputDemo() {
  return (
    <div className="space-y-8 min-w-[400px]">
      <div>
        <AIInput
          onSubmit={(value, images) => {
            console.log('Submitted text:', value);
            console.log('Submitted images:', images);
          }}
          fixedHeight={true}
        />
      </div>
    </div>
  )
}
