const quote=(value)=>`"${String(value).replaceAll('"','""')}"`;
export function createUsbCPinReport(project){
  const rows=[["Connector","Contact","Signal","Mapped net","Purpose"]];
  for(const item of project?.pcbFabrication?.connectorPinMap??[])rows.push([item.reference,item.pin,item.signal,item.netId,item.purpose]);
  return rows.map(row=>row.map(quote).join(",")).join("\r\n")+"\r\n";
}
