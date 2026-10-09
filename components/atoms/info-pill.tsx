type InfoPillProps = {
    title: string;
    value: string;
    icon: any;
  };
  
  export const InfoPill = ({ title, value, icon: Icon }: InfoPillProps) => {
    return (
      <div className="flex flex-row items-start gap-2 p-2 ">
        <div className="p-2 bg-primary text-background rounded-sm">
        <Icon size={16} />
        </div>
        <div className="-mt-1">
          <p className="font-semibold">{title}</p>
          <p>{value}</p>
        </div>
      </div>
    );
  };
  