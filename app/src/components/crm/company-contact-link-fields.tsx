"use client";

import {useEffect, useMemo, useState} from "react";

import type {AppLocale} from "@/i18n/routing";

import {SearchableOptionField} from "./searchable-option-field";

type CompanyOption = {
  id: string;
  companyName: string;
};

type ContactOption = {
  id: string;
  fullName: string;
  companyId: string | null;
};

type CompanyContactLinkFieldsProps = {
  companies: CompanyOption[];
  contacts: ContactOption[];
  companyFieldName: string;
  companyInvalid?: boolean;
  contactFieldName: string;
  contactInvalid?: boolean;
  locale: AppLocale;
  value: {
    companyId?: string;
    contactId?: string;
  };
};

export function CompanyContactLinkFields({
  companies,
  contacts,
  companyFieldName,
  companyInvalid,
  contactFieldName,
  contactInvalid,
  locale,
  value
}: CompanyContactLinkFieldsProps) {
  const [companyId, setCompanyId] = useState(value.companyId ?? "");
  const [contactId, setContactId] = useState(value.contactId ?? "");

  useEffect(() => {
    setCompanyId(value.companyId ?? "");
    setContactId(value.contactId ?? "");
  }, [value.companyId, value.contactId]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === contactId) ?? null,
    [contactId, contacts]
  );

  useEffect(() => {
    if (!selectedContact) {
      return;
    }

    if (selectedContact.companyId) {
      if (companyId !== selectedContact.companyId) {
        setCompanyId(selectedContact.companyId);
      }
      return;
    }

    if (companyId) {
      setCompanyId("");
    }
  }, [companyId, selectedContact]);

  const filteredContacts = useMemo(() => {
    if (!companyId) {
      return contacts;
    }

    return contacts.filter((contact) => contact.companyId === companyId);
  }, [companyId, contacts]);

  const filteredCompanies = useMemo(() => {
    if (!selectedContact) {
      return companies;
    }

    if (!selectedContact.companyId) {
      return companies;
    }

    return companies.filter((company) => company.id === selectedContact.companyId);
  }, [companies, selectedContact]);

  useEffect(() => {
    if (!contactId) {
      return;
    }

    const stillVisible = filteredContacts.some((contact) => contact.id === contactId);

    if (!stillVisible) {
      setContactId("");
    }
  }, [contactId, filteredContacts]);

  return (
    <>
      <SearchableOptionField
        emptyLabel={locale === "he" ? "ללא חברה" : "No company"}
        invalid={companyInvalid}
        label={locale === "he" ? "חברה" : "Company"}
        name={companyFieldName}
        noResultsLabel={locale === "he" ? "לא נמצאו חברות" : "No companies found"}
        onValueChange={setCompanyId}
        options={filteredCompanies.map((company) => ({id: company.id, label: company.companyName}))}
        placeholder={locale === "he" ? "חיפוש חברה" : "Search company"}
        searchPlaceholder={locale === "he" ? "חיפוש חברה אחרת" : "Search another company"}
        value={companyId}
      />
      <SearchableOptionField
        emptyLabel={locale === "he" ? "ללא איש קשר" : "No contact"}
        invalid={contactInvalid}
        label={locale === "he" ? "איש קשר" : "Contact"}
        name={contactFieldName}
        noResultsLabel={locale === "he" ? "לא נמצאו אנשי קשר" : "No contacts found"}
        onValueChange={setContactId}
        options={filteredContacts.map((contact) => ({id: contact.id, label: contact.fullName}))}
        placeholder={locale === "he" ? "חיפוש איש קשר" : "Search contact"}
        searchPlaceholder={locale === "he" ? "חיפוש איש קשר אחר" : "Search another contact"}
        value={contactId}
      />
    </>
  );
}
