<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .invoice-details {
            margin-bottom: 30px;
        }
        .customer-details {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
        }
        .total {
            text-align: right;
            font-weight: bold;
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
    </div>

    <div class="invoice-details">
        <p><strong>Invoice Number:</strong> {{ $invoice_no }}</p>
        <p><strong>Date:</strong> {{ $date }}</p>
    </div>

    <div class="customer-details">
        <h3>Bill To:</h3>
        @if($customer)
            <p>{{ $customer->addressInfo->name ?? 'N/A' }}</p>
            <p>{{ $customer->addressInfo->street ?? 'N/A' }}</p>
            <p>{{ $customer->addressInfo->city ?? 'N/A' }}, {{ $customer->addressInfo->postcode ?? 'N/A' }}</p>
            <p>{{ $customer->addressInfo->country ?? 'N/A' }}</p>
        @else
            <p>Guest Order</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item['name'] }}</td>
                <td>{{ $item['variant'] }}</td>
                <td>{{ $item['quantity'] }}</td>
                <td>${{ number_format($item['price'], 2) }}</td>
                <td>${{ number_format($item['price'] * $item['quantity'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        <p>Total: ${{ number_format($order->total, 2) }}</p>
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
    </div>
</body>
</html>