import { useContractTemplate } from "@/app/hooks/contract-template";

export default function GenerateTemplate(contractTemplateId: string) {
    const {data} = useContractTemplate({id});
  return <div>GenerateTemplate</div>;
}