<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<title>Order Invoice</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}

		.container {
			width: 80%;
			margin: 0 auto;
			padding: 10px;
		}

		.header {
			text-align: center;
			margin-bottom: 20px;
		}

		.header h1 {
			margin: 0;
			font-size: 24px;
		}

		.customer-info,
		.items {
			width: 100%;
			margin-bottom: 5px;
		}

		.customer-info h2,
		.items h2 {
			font-size: 18px;
			margin-bottom: 10px;
		}

		.customer-info p,
		.items p {
			margin: 0;
		}

		.items table {
			width: 100%;
			border-collapse: collapse;
		}

		.items table,
		.items th,
		.items td {
			border: 1px solid black;
		}

		.items th,
		.items td {
			padding: 8px;
			text-align: left;
		}

		.total {
			text-align: right;
			margin-top: 20px;
		}

		.billing-info {
			display: flex;
			margin-bottom: 20px;
		}

		.billing-info .left,
		.billing-info .right {
			width: 48%;
		}

		.order-summary {
			margin-top: 20px;
		}

		.order-summary table {
			width: 100%;
			border-collapse: collapse;
		}

		.order-summary th,
		.order-summary td {
			padding: 8px;
			border: 1px solid #ddd;
			text-align: left;
		}

		.order-summary th {
			background-color: #f4f4f4;
		}

		.footer {
			margin-top: 20px;
			text-align: right;
		}

		.footer p {
			margin: 0;
		}
	</style>
</head>

<body>
	<div class="container">
		<div class="header">
			<h1>Order Invoice {{ $orderId }}</h1>
		</div>
		<div class="billing-info">
			<div class="left">
				<h2>{{ $websiteName }}</h2>
				<div>{{$websiteShopAdress}}</div>
				<div>Email:{{$websiteEmail}}</div>
				<div>Phone:{{$websitePhone}}</div>
			</div>
			<div class="right">
				<h2>Billed To:</h2>
				<div><strong>{{ $customer->name }}</strong></div>
				<div>{{ $customer->addressInfo->street }}</div>
				<div>{{ $customer->addressInfo->city }}, {{ $customer->addressInfo->postcode }}</div>
				<div>{{ $customer->addressInfo->country }}</div>
				<div>Email: {{ $customer->email }}</div>
				<div>Phone: {{ $customer->phone }}</div>
			</div>
		</div>
		<div class="order-summary">
			<h2>Items</h2>
			<table>
				<thead>
					<tr>
						<th>No.</th>
						<th>Name</th>
						<th>Type</th>
						<th>Quantity</th>
						<th>Price</th>
						<th>Total</th>
					</tr>
				</thead>
				<tbody>
					@foreach ($items as $index => $item)
					<tr>
						<td>{{ $index + 1 }}</td>
						<td>{{ $item->subproduct->product->name }}</td>
						<td>{{ $item->subproduct->name }}</td>
						<td>{{ $item->quantity }}</td>
						<td>{{ $item->subproduct->price }}</td>
						<td>{{ $item->subproduct->price * $item->quantity }}</td>
					</tr>
					@endforeach
				</tbody>
			</table>
			<div class="total">
				<p><strong>Total Price:</strong> {{ number_format($items->sum(fn($item) => $item->subproduct->price * $item->quantity), 2) }}</p>
			</div>
		</div>
	</div>
</body>

</html>