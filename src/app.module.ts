import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ContactsModule } from './contacts/contacts.module';
import { AccountsPayableModule } from './accounts-payable/accounts-payable.module'; 
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { TravelExpensesModule } from './travel-expenses/travel-expenses.module';
import { MunicipalitiesModule } from './municipalities/municipalities.module';
import { DepartmentsModule } from './departments/departments.module';
import { ContractsModule } from './contracts/contracts.module';
import { ReceivablesModule } from './receivables/receivables.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    SuppliersModule,
    ProductsModule,
    StockMovementsModule,
    DashboardModule,
    ReportsModule,
    ContactsModule,
    AccountsPayableModule,
    UsersModule,
    AuthModule,
    PaymentsModule,
    TravelExpensesModule,
    MunicipalitiesModule,
    DepartmentsModule,
    ContractsModule,
    ReceivablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}