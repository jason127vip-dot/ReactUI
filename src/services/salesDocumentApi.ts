import { request } from '../utils/api'
import { Payment, PaymentFormValues, PaymentOrderSummary, PaymentStatus } from '../views/payments/types'
import { SalesOutbound, SalesOutboundFormValues, SalesOutboundLine, SalesOutboundStatus } from '../views/sales-outbound/types'
import { SalesOrder, SalesOrderStatus } from '../views/sales-orders/types'

type R<T> = { code: number; message: string; data: T }
type RawOrder = { id:number;orderNo:string;customerId:number;customer:{name:string};orderDate:string;customerPoNo?:string;expectedOutboundDate?:string;salesperson?:string;remarks?:string;status:string;totalAmount:number;totalQuantity?:number;outboundStatus?:string;paymentStatus?:string;paidAmount?:number;unpaidAmount?:number;createdAt:string;lines:Array<{id:number;productId:number;productCode:string;productName:string;specification?:string;unit:string;unitPrice:number;quantity:number;amount:number}> }
type RawOutbound = {id:number;outboundNo:string;salesOrderId:number;salesOrder:RawOrder;outboundDate:string;status:string;createdAt:string;lines:Array<{id:number;salesOrderLineId:number;outboundQuantity:number;salesOrderLine:{productCode:string;productName:string;unit:string;quantity:number}}>}
type RawPayment = {id:number;paymentNo:string;salesOrderId:number;salesOrder:RawOrder;paymentDate:string;amount:number;method:string;referenceNo?:string;status:string;createdAt:string}
type RawOutboundLine = {id:number;salesOrderLineId:number;productCode:string;productName:string;unit:string;orderedQuantity:number;remainingQuantity:number;outboundQuantity:number}

const order = (o:RawOrder):SalesOrder => ({id:String(o.id),orderNo:o.orderNo,customerId:String(o.customerId),customerName:o.customer.name,orderDate:o.orderDate.slice(0,10),customerPoNo:o.customerPoNo,expectedOutboundDate:o.expectedOutboundDate?.slice(0,10),salesperson:o.salesperson,remarks:o.remarks,status:o.status as SalesOrderStatus,totalAmount:o.totalAmount,totalQuantity:o.totalQuantity,outboundStatus:o.outboundStatus as SalesOrder['outboundStatus'],paymentStatus:o.paymentStatus as SalesOrder['paymentStatus'],paidAmount:o.paidAmount,unpaidAmount:o.unpaidAmount,createdAt:o.createdAt,lines:o.lines.map(l=>({...l,id:String(l.id),productId:String(l.productId)}))})
const outbound = (o:RawOutbound):SalesOutbound => ({id:String(o.id),outboundNo:o.outboundNo,salesOrderId:String(o.salesOrderId),orderNo:o.salesOrder.orderNo,customerName:o.salesOrder.customer.name,outboundDate:o.outboundDate.slice(0,10),status:o.status as SalesOutboundStatus,createdAt:o.createdAt,lines:o.lines.map(l=>({id:String(l.id),salesOrderLineId:String(l.salesOrderLineId),productCode:l.salesOrderLine.productCode,productName:l.salesOrderLine.productName,unit:l.salesOrderLine.unit,orderedQuantity:l.salesOrderLine.quantity,remainingQuantity:0,outboundQuantity:l.outboundQuantity}))})
const payment = (p:RawPayment):Payment => ({id:String(p.id),paymentNo:p.paymentNo,salesOrderId:String(p.salesOrderId),orderNo:p.salesOrder.orderNo,customerName:p.salesOrder.customer.name,paymentDate:p.paymentDate.slice(0,10),amount:p.amount,method:p.method,referenceNo:p.referenceNo,status:p.status as PaymentStatus,createdAt:p.createdAt})
const outboundPayload=(v:SalesOutboundFormValues)=>({salesOrderId:Number(v.salesOrderId),outboundDate:v.outboundDate,lines:v.lines.filter(l=>l.outboundQuantity>0).map(l=>({salesOrderLineId:Number(l.salesOrderLineId),outboundQuantity:l.outboundQuantity}))})
const paymentPayload=(v:PaymentFormValues)=>({...v,salesOrderId:Number(v.salesOrderId)})

export const getSalesOutbounds=async()=>outboundList((await request.get<R<RawOutbound[]>>('/sales-outbounds')).data)
const outboundList=(rows:RawOutbound[])=>rows.map(outbound)
export const getAvailableSalesOrdersForOutbound=async()=>((await request.get<R<RawOrder[]>>('/sales-outbounds/available-orders')).data.map(order))
export const getOutboundLinesForOrder=async(id:string):Promise<SalesOutboundLine[]> => (await request.get<R<RawOutboundLine[]>>(`/sales-outbounds/order/${id}/lines`)).data.map(l=>({...l,id:String(l.id),salesOrderLineId:String(l.salesOrderLineId)}))
export const createSalesOutbound=async(v:SalesOutboundFormValues)=>outbound((await request.post<R<RawOutbound>>('/sales-outbounds',outboundPayload(v))).data)
export const updateSalesOutbound=async(id:string,v:SalesOutboundFormValues)=>outbound((await request.put<R<RawOutbound>>(`/sales-outbounds/${id}`,outboundPayload(v))).data)
export const confirmSalesOutbound=async(id:string)=>outbound((await request.post<R<RawOutbound>>(`/sales-outbounds/${id}/confirm`)).data)
export const cancelSalesOutboundConfirmation=async(id:string)=>outbound((await request.post<R<RawOutbound>>(`/sales-outbounds/${id}/cancel-confirmation`)).data)
export const deleteSalesOutbound=async(id:string)=>{await request.delete(`/sales-outbounds/${id}`)}

export const getPayments=async()=>((await request.get<R<RawPayment[]>>('/payments')).data.map(payment))
export const getPaymentOrderSummaries=async():Promise<PaymentOrderSummary[]> => (await request.get<R<Array<{id:number;orderNo:string;customerName:string;orderAmount:number;paidAmount:number;unpaidAmount:number}>>>('/payments/order-summaries')).data.map(o=>({...o,id:String(o.id)}))
export const createPayment=async(v:PaymentFormValues)=>payment((await request.post<R<RawPayment>>('/payments',paymentPayload(v))).data)
export const updatePayment=async(id:string,v:PaymentFormValues)=>payment((await request.put<R<RawPayment>>(`/payments/${id}`,paymentPayload(v))).data)
export const confirmPayment=async(id:string)=>payment((await request.post<R<RawPayment>>(`/payments/${id}/confirm`)).data)
export const cancelPaymentConfirmation=async(id:string)=>payment((await request.post<R<RawPayment>>(`/payments/${id}/cancel-confirmation`)).data)
export const deletePayment=async(id:string)=>{await request.delete(`/payments/${id}`)}
export const getSalesOrderExecution=async(id:string)=>{const data=(await request.get<R<{outbounds:RawOutbound[];payments:RawPayment[]}>>(`/sales-orders/${id}/execution`)).data;return{outbounds:data.outbounds.map(outbound),payments:data.payments.map(payment)}}
