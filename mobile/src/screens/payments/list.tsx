import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { PaymentItem, paymentService } from '../../services/payments';
import { RootTabParamList } from '../../routes/root';
import { useTranslation } from 'react-i18next';

type PaymentsListNavigationProp = NavigationProp<RootTabParamList>;

export const PaymentsListScreen: React.FC = () => {
	const { t } = useTranslation();
	const navigation = useNavigation<PaymentsListNavigationProp>();
	const [items, setItems] = useState<PaymentItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadPayments = useCallback(async (refresh = false) => {
		if (refresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}

		try {
			setError(null);
			const response = await paymentService.listPayments(1, 10);
			setItems(response.items);
		} catch {
			setError(t('payments.errorCreate'));
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadPayments();
	}, [loadPayments]);

	const renderItem = ({ item }: { item: PaymentItem }) => (
		<View style={styles.card}>
			<View style={styles.rowBetween}>
				<Text style={styles.transactionId}>{item.transactionId}</Text>
				<Text
					style={[
						styles.status,
						item.status === 'approved' ? styles.approved : styles.declined,
					]}
				>
					{item.status.toUpperCase()}
				</Text>
			</View>
			<Text style={styles.meta}>Holder: {item.holderName}</Text>
			<Text style={styles.meta}>Card ending: {item.cardNumberLast4}</Text>
			<Text style={styles.meta}>Amount: ${item.amount.toFixed(2)}</Text>
			<Text style={styles.meta}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
		</View>
	);

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#2563eb" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.newPaymentButton}
				onPress={() => navigation.navigate('NewPayment')}
			>
				<Text style={styles.newPaymentButtonText}>{t('payments.tabs.new')}</Text>
			</TouchableOpacity>

			{error ? <Text style={styles.errorText}>{error}</Text> : null}

			<FlatList
				data={items}
				keyExtractor={(item) => item.transactionId}
				renderItem={renderItem}
				contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={() => loadPayments(true)}
						tintColor="#004c48"
					/>
				}
				ListEmptyComponent={
					<View style={styles.centered}>
						<Text style={styles.emptyText}>{t('payments.notFound')}</Text>
					</View>
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
		padding: 16,
	},
	listContent: {
		paddingBottom: 20,
	},
	emptyContainer: {
		flexGrow: 1,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	card: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 14,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	rowBetween: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	transactionId: {
		flex: 1,
		color: '#111827',
		fontSize: 13,
		fontWeight: '700',
		marginRight: 8,
	},
	status: {
		fontSize: 11,
		fontWeight: '700',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: 'hidden',
	},
	approved: {
		color: '#166534',
		backgroundColor: '#dcfce7',
	},
	declined: {
		color: '#991b1b',
		backgroundColor: '#fee2e2',
	},
	meta: {
		color: '#4b5563',
		fontSize: 13,
		marginBottom: 4,
	},
	emptyText: {
		color: '#6b7280',
		fontSize: 15,
	},
	errorText: {
		color: '#b91c1c',
		marginBottom: 10,
		fontSize: 13,
	},
	newPaymentButton: {
		backgroundColor: '#004c48',
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: 'center',
		marginBottom: 14,
	},
	newPaymentButtonText: {
		color: '#ffffff',
		fontWeight: '700',
		fontSize: 14,
	},
});

export default PaymentsListScreen;
